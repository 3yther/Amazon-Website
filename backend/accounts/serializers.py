from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.models import User
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers

from content.models import PathwayName

from .models import Profile

# Staff accounts are created in Django admin only, never through sign-up.
REGISTRATION_USER_TYPES = [
    (value, label)
    for value, label in Profile.UserType.choices
    if value != Profile.UserType.AMAZON_STAFF
]

USERNAME_TAKEN = "A user with that username already exists."
INVALID_CREDENTIALS = "Invalid username or password."


class AccountSerializer(serializers.ModelSerializer):
    """The minimal user details returned after register and login."""

    user_type = serializers.CharField(source="profile.user_type", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "user_type"]


class CurrentUserSerializer(AccountSerializer):
    """What GET /api/accounts/me/ returns."""

    pathway_interest = serializers.CharField(source="profile.pathway_interest", read_only=True)

    class Meta(AccountSerializer.Meta):
        fields = [*AccountSerializer.Meta.fields, "pathway_interest"]


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
