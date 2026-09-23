from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.models import User
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from content.models import PathwayName

from .models import Profile, UserPreference

# Staff accounts are created in Django admin only, never through sign-up.
REGISTRATION_USER_TYPES = [
    (value, label)
    for value, label in Profile.UserType.choices
    if value != Profile.UserType.AMAZON_STAFF
]

USERNAME_TAKEN = "A user with that username already exists."
INVALID_CREDENTIALS = "Invalid username or password."
INCORRECT_PASSWORD = "Current password is incorrect."
INCORRECT_DEACTIVATE_PASSWORD = "Incorrect password."


class AccountSerializer(serializers.ModelSerializer):
    """The minimal user details returned after register and login."""

    user_type = serializers.CharField(source="profile.user_type", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "user_type"]


class UserPreferenceSerializer(serializers.ModelSerializer):
    """
    Validates each preference against the ranges and choices defined on
    UserPreference itself (ModelSerializer picks up the model's own
    validators, so the 80-150 and 0-3 range checks live in one place).
    """

    class Meta:
        model = UserPreference
        fields = [
            "font_size_scale",
            "high_contrast",
            "text_spacing_level",
            "color_blindness_type",
            "text_to_speech",
            "reduce_motion",
            "theme",
            "button_outline_style",
            "page_background",
            "language",
            "date_format",
            "number_format",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class CurrentUserSerializer(AccountSerializer):
    """
    What GET /api/accounts/me/ returns, and PATCH /api/accounts/me/ accepts
    (first_name, last_name, email, phone).
    """

    pathway_interest = serializers.CharField(source="profile.pathway_interest", read_only=True)
    phone = serializers.CharField(source="profile.phone", required=False, allow_blank=True)
    last_password_changed = serializers.DateTimeField(source="profile.last_password_changed", read_only=True)
    preferences = serializers.SerializerMethodField()

    def get_preferences(self, instance):
        # Created with defaults on first access, same as GET /user-preferences/.
        preference, _ = UserPreference.objects.get_or_create(user=instance)
        return UserPreferenceSerializer(preference).data

    class Meta(AccountSerializer.Meta):
        fields = [
            *AccountSerializer.Meta.fields,
            "pathway_interest",
            "first_name",
            "last_name",
            "email",
            "phone",
            "last_password_changed",
            "preferences",
        ]

    def update(self, instance, validated_data):
        # ModelSerializer.update() cannot write a dotted source (profile.phone)
        # by itself, so the profile half is pulled out and saved separately.
        profile_data = validated_data.pop("profile", None)
        instance = super().update(instance, validated_data)
        if profile_data:
            Profile.objects.filter(pk=instance.profile.pk).update(**profile_data)
        return instance


class RegisterSerializer(serializers.Serializer):
    """
    Validates a sign-up server side and creates the User plus its Profile.

    Django hashes the password. Passwords are write-only, so the response
    never echoes them back.

    Every check is field-level, so one 400 lists every problem at once. DRF
    skips validate() while any field has an error, so nothing lives there.
    """

    username = serializers.CharField(max_length=150, validators=[UnicodeUsernameValidator()])
    password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )
    password_confirm = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )
    user_type = serializers.ChoiceField(choices=REGISTRATION_USER_TYPES)
    pathway_interest = serializers.ChoiceField(
        choices=PathwayName.choices, required=False, allow_null=True, allow_blank=True
    )

    def validate_username(self, value):
        username = User.normalize_username(value)
        # Case-insensitive, like Django's own sign-up form, so "Ada" and "ada"
        # cannot both exist.
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError(USERNAME_TAKEN)
        return username

    def validate_password(self, value):
        # Runs AUTH_PASSWORD_VALIDATORS from settings. The unsaved User lets the
        # similarity check compare the password with the submitted username,
        # read from the raw input because field checks cannot see each other.
        user = User(username=self.initial_data.get("username"))
        try:
            password_validation.validate_password(value, user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate_password_confirm(self, value):
        # Compared with the raw password, so a mismatch is reported even when
        # the password itself also failed its own checks.
        if value != self.initial_data.get("password"):
            raise serializers.ValidationError("Passwords do not match.")
        return value

    def validate_pathway_interest(self, value):
        return value or None  # an empty select means no answer

    def create(self, validated_data):
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=validated_data["username"], password=validated_data["password"]
                )
                Profile.objects.create(
                    user=user,
                    user_type=validated_data["user_type"],
                    pathway_interest=validated_data.get("pathway_interest"),
                )
        except IntegrityError:
            # Two sign-ups raced for the same username and the database refused one.
            raise serializers.ValidationError({"username": [USERNAME_TAKEN]})
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Checks the current password, then the new one, like RegisterSerializer."""

    current_password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(INCORRECT_PASSWORD)
        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        try:
            password_validation.validate_password(value, user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate_confirm_password(self, value):
        if value != self.initial_data.get("new_password"):
            raise serializers.ValidationError("Passwords do not match.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        Profile.objects.filter(user=user).update(last_password_changed=timezone.now())
        return user


class DeactivateAccountSerializer(serializers.Serializer):
    """Checks the password, then deactivates the account in .save()."""

    password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(INCORRECT_DEACTIVATE_PASSWORD)
        return value

    def save(self):
        user = self.context["request"].user
        user.is_active = False
        user.save(update_fields=["is_active"])
        Profile.objects.filter(user=user).update(is_deactivated=True, deactivated_at=timezone.now())
        return user


class LoginSerializer(serializers.Serializer):
    """Checks a username and password with Django's auth backend."""

    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True, trim_whitespace=False, style={"input_type": "password"}
    )

    def validate(self, attrs):
        # authenticate() returns None for a wrong password, an unknown username
        # or a deactivated account. All three get the same message, so the
        # response never reveals which usernames exist.
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError(INVALID_CREDENTIALS, code="authorization")
        attrs["user"] = user
        return attrs
