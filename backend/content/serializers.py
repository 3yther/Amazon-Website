from rest_framework import serializers

from .models import ContentItem, Pathway


class PathwaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pathway
        fields = ["name", "slug", "summary", "description"]


class PathwaySummarySerializer(serializers.ModelSerializer):
    """Just enough to label a content item with its pathway."""

    class Meta:
        model = Pathway
        fields = ["name", "slug"]


class ContentItemSerializer(serializers.ModelSerializer):
    """
    A library item. Sign-up content is always listed so visitors can see it
    exists, but its file link is only sent to signed-in users.
    """

    pathway = PathwaySummarySerializer(read_only=True)
    file = serializers.SerializerMethodField()
    locked = serializers.SerializerMethodField()

    class Meta:
        model = ContentItem
        fields = [
            "title",
            "slug",
            "description",
            "content_type",
            "access_level",
            "pathway",
            "audience",
            "file",
            "locked",
            "created_at",
        ]

    def get_locked(self, item):
        """True when the item needs an account and the visitor is not signed in."""
        request = self.context.get("request")
        signed_in = bool(request and request.user.is_authenticated)
        return item.access_level == ContentItem.AccessLevel.SIGNUP and not signed_in

    def get_file(self, item):
        if not item.file or self.get_locked(item):
            return None
        request = self.context.get("request")
        url = item.file.url
        return request.build_absolute_uri(url) if request else url
