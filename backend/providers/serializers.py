from rest_framework import serializers

from content.serializers import PathwaySummarySerializer

from .models import Provider


class ProviderSearchResultSerializer(serializers.ModelSerializer):
    """One provider in a search result. distance_miles is worked out by the view,
    it isn't stored.
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
            "distance_miles",
            "website_url",
            "pathways",
        ]
