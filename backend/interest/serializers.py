import re

from django.contrib.auth.base_user import BaseUserManager
from rest_framework import serializers

from content.models import Pathway

from .models import ExpressionOfInterest

# Letters from any language, joined by single spaces, hyphens, apostrophes or
# full stops. Allows "Jean-Luc O'Brien" and "Dr. Ada Lovelace"; blocks digits,
# symbols and markup.
NAME_PATTERN = re.compile(r"^[^\W\d_]+(?:[ '’.\-]+[^\W\d_]+)*\.?$")

MESSAGE_MAX_LENGTH = 2000


class ExpressionOfInterestSerializer(serializers.ModelSerializer):
    """
    Validates an Expression of Interest server side. The front end may check
    too, but this is the check that counts.

    Personal fields are write-only, so the response never echoes them back.
    """

    pathway = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Pathway.objects.all(),
        error_messages={
            "does_not_exist": "Choose a valid pathway.",
            "invalid": "Choose a valid pathway.",
        },
    )
    message = serializers.CharField(
        required=False, allow_blank=True, max_length=MESSAGE_MAX_LENGTH, write_only=True
    )

    class Meta:
        model = ExpressionOfInterest
        fields = ["id", "full_name", "email", "user_type", "pathway", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at"]
        extra_kwargs = {
            "full_name": {"write_only": True, "min_length": 2},
            "email": {"write_only": True},
            "user_type": {"write_only": True},
        }

    def validate_full_name(self, value):
        name = " ".join(value.split())  # collapse repeated spaces
        if not NAME_PATTERN.match(name):
            raise serializers.ValidationError(
                "Use letters, spaces, hyphens or apostrophes only."
            )
        return name

    def validate_email(self, value):
        # Lower-case the domain part, as Django does for user emails.
        return BaseUserManager.normalize_email(value.strip())
