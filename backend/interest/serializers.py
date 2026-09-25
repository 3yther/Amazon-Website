import re

from django.contrib.auth.base_user import BaseUserManager
from rest_framework import serializers

from content.models import Pathway

from .models import ExpressionOfInterest

# Letters in any language with spaces, hyphens, apostrophes or full stops,
# e.g. "Jean-Luc O'Brien". No numbers, symbols or HTML.
NAME_PATTERN = re.compile(r"^[^\W\d_]+(?:[ '’.\-]+[^\W\d_]+)*\.?$")

MESSAGE_MAX_LENGTH = 2000


class ExpressionOfInterestSerializer(serializers.ModelSerializer):
    """Checks an Expression of Interest on the server.
    Personal fields are write-only so they're never sent back.
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


class ExpressionOfInterestStaffSerializer(serializers.ModelSerializer):
    """What Amazon staff see on the submissions list. Separate from the one above
    so that one can keep the personal fields write-only.
    """

    pathway = serializers.SlugRelatedField(slug_field="slug", read_only=True)

    class Meta:
        model = ExpressionOfInterest
        fields = ["id", "full_name", "email", "user_type", "pathway", "message", "submitted_at"]
        read_only_fields = fields
