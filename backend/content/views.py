from django.db.models import Q
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import ContentItem, Pathway
from .serializers import ContentItemSerializer, PathwaySerializer


class PathwayViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/pathways/          all pathways (a short fixed list, so not paginated)
    GET /api/pathways/<slug>/   one pathway
    """

    queryset = Pathway.objects.all()
    serializer_class = PathwaySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    pagination_class = None


class ContentItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/content/          paginated list, newest first
    GET /api/content/<slug>/   one item

    Optional list filters (combine freely):
      ?pathway=<slug>          that pathway plus items for all pathways
      ?audience=<value>        student | parent | teacher, plus items for everyone
      ?access_level=<value>    free | signup
    """

    serializer_class = ContentItemSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = ContentItem.objects.select_related("pathway")
        if self.action == "list":
            queryset = self.filter_list(queryset)
        return queryset

    def filter_list(self, queryset):
        """Apply query string filters, rejecting unknown values with a 400."""
        params = self.request.query_params
        errors = {}

        pathway = params.get("pathway")
        if pathway:
            if Pathway.objects.filter(slug=pathway).exists():
                queryset = queryset.filter(Q(pathway__slug=pathway) | Q(pathway__isnull=True))
            else:
                errors["pathway"] = [f'Unknown pathway "{pathway}".']

        audience = params.get("audience")
        if audience:
            if audience not in ContentItem.Audience.values:
                errors["audience"] = [f"Choose one of: {', '.join(ContentItem.Audience.values)}."]
            elif audience == ContentItem.Audience.ALL:
                queryset = queryset.filter(audience=ContentItem.Audience.ALL)
            else:
                queryset = queryset.filter(audience__in=[audience, ContentItem.Audience.ALL])

        access_level = params.get("access_level")
        if access_level:
            if access_level in ContentItem.AccessLevel.values:
                queryset = queryset.filter(access_level=access_level)
            else:
                errors["access_level"] = [
                    f"Choose one of: {', '.join(ContentItem.AccessLevel.values)}."
                ]

        if errors:
            raise ValidationError(errors)
        return queryset
