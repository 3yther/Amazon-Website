from rest_framework import serializers

from .models import ExpressionOfInterest


class InterestOptInSerializer(serializers.ModelSerializer):
    """
    The answer to ticking "I'm interested in an Amazon placement".

    Takes no input at all. That is the point of the change: the site already
    holds the name, email, role and pathway this used to ask for, so the view
    copies them off the account (see ExpressionOfInterest.record_for). What
    comes back is only what was recorded, so the page can say it back without
    the visitor having to trust that anything was stored.
    """

    pathway = serializers.SlugRelatedField(slug_field="slug", read_only=True)

    class Meta:
        model = ExpressionOfInterest
        fields = ["id", "pathway", "submitted_at"]
        read_only_fields = fields


class ExpressionOfInterestStaffSerializer(serializers.ModelSerializer):
    """What Amazon staff see on the submissions list.

    username comes along because the other four fields are now optional: an
    account that never filled in a name or email still needs to be somebody
    the team can go and find.
    """

    pathway = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True, default="")

    class Meta:
        model = ExpressionOfInterest
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "user_type",
            "pathway",
            "message",
            "submitted_at",
        ]
        read_only_fields = fields
