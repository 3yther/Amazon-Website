from rest_framework import serializers

from content.serializers import PathwaySummarySerializer

from .models import Provider


class ProviderSearchResultSerializer(serializers.ModelSerializer):
    """
    One provider in a search result.

    distance_miles is not a model field: the view works it out for this
    search and hangs it on each provider before serialising, because how far
    away a college is depends on who is asking.

    pathways_confirmed travels with the row because an empty pathways list on
    its own is ambiguous, and the card has to word itself differently for
    "offers none of the five" than for "we have not checked this one".
    """

    pathways = PathwaySummarySerializer(many=True, read_only=True)
    distance_miles = serializers.FloatField(read_only=True)

    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "address",
            "postcode",
            "region",
            "provider_type",
            "foundation_year",
            "distance_miles",
            "website_url",
            "pathways",
            "pathways_confirmed",
        ]
