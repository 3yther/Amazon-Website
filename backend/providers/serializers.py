from rest_framework import serializers

from content.serializers import PathwaySummarySerializer

from .models import Provider


class ProviderSearchResultSerializer(serializers.ModelSerializer):
    """One provider in a search result. distance_miles is worked out by the view,
    it isn't stored.

    pathways_confirmed comes too: an empty pathways list is ambiguous on its own,
    so the card needs to know "offers none of the five" from "not checked yet".
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
