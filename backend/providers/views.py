import logging

from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from content.models import Pathway

from .distance import haversine_miles
from .models import Provider
from .postcodes import PostcodeServiceUnavailable, lookup
from .serializers import ProviderSearchResultSerializer

logger = logging.getLogger(__name__)

# What a visitor gets if they do not choose: wide enough to reach a college
# from most of the country, narrow enough that the list stays useful.
DEFAULT_RADIUS_MILES = 15

# Not a rule about travel, just a sane ceiling. Past this the search stops
# meaning "near you" and starts meaning "every provider we hold".
MAX_RADIUS_MILES = 200


class PostcodeLookupUnavailable(APIException):
    """postcodes.io is down. A 503 because it isn't the visitor's fault."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = (
        "The postcode lookup service is unavailable right now. Please try again shortly."
    )
    default_code = "postcode_lookup_unavailable"


class ProviderSearchView(APIView):
    """GET /api/providers/search/   schools and colleges near a postcode

    ?postcode=  required
    ?pathway=   optional slug
    ?radius=    optional, miles, default 15, max 200

    Returns { postcode, radius_miles, count, results }, nearest first.
    A bad value gives a 400 naming the field. No account needed.

    Not paginated on purpose: every provider inside the radius comes back,
    because NearYou.jsx reads them all at once. There are tests for this.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        postcode, pathway, radius = self.read_query(request.query_params)
        origin = self.locate(postcode)

        providers = Provider.objects.geocoded().prefetch_related("pathways")
        if pathway:
            providers = providers.filter(pathways__slug=pathway)

        results = self.within(providers, origin, radius)
        if not results:
            self.explain_empty()
        return Response(
            {
                "postcode": postcode,
                "radius_miles": radius,
                "count": len(results),
                "results": ProviderSearchResultSerializer(results, many=True).data,
            }
        )

    def explain_empty(self):
        """Logs why a search found nothing, so an empty providers table (a broken
        deploy) isn't mistaken for "no colleges near you". See also check_providers.
        """
        searchable = Provider.objects.geocoded().count()
        if searchable:
            return  # a real "nothing near you", which is not a fault

        total = Provider.objects.count()
        if total:
            logger.error(
                "Provider search found nothing because none of the %s provider(s) have a "
                "position. Run: python manage.py geocode_providers",
                total,
            )
        else:
            logger.error(
                "Provider search found nothing because no providers are loaded at all. "
                "Run: python manage.py loaddata providers && python manage.py geocode_providers"
            )

    def read_query(self, params):
        """Check the query string, rejecting anything unusable with a 400."""
        errors = {}

        postcode = (params.get("postcode") or "").strip()
        if not postcode:
            errors["postcode"] = ["Enter a postcode."]

        pathway = params.get("pathway") or ""
        if pathway and not Pathway.objects.filter(slug=pathway).exists():
            errors["pathway"] = [f'Unknown pathway "{pathway}".']

        radius = DEFAULT_RADIUS_MILES
        given = params.get("radius")
        if given:
            try:
                radius = float(given)
            except ValueError:
                radius = 0
            if not 0 < radius <= MAX_RADIUS_MILES:
                errors["radius"] = [f"Choose a distance between 1 and {MAX_RADIUS_MILES} miles."]

        if errors:
            raise ValidationError(errors)
        return postcode.upper(), pathway, radius

    def locate(self, postcode):
        """
        The visitor's postcode as a point, or a 400 if there is no such
        postcode. This is the one outside call a search makes.
        """
        try:
            point = lookup(postcode)
        except PostcodeServiceUnavailable as error:
            raise PostcodeLookupUnavailable() from error

        if point is None:
            raise ValidationError(
                {"postcode": [f'We could not find the postcode "{postcode}". Check it and try again.']}
            )
        return point

    def within(self, providers, origin, radius):
        """The providers inside the radius, nearest first, each with its distance.
        Worked out in Python because there aren't many providers.
        """
        latitude, longitude = origin
        near = []
        for provider in providers:
            miles = haversine_miles(latitude, longitude, provider.latitude, provider.longitude)
            if miles <= radius:
                provider.distance_miles = round(miles, 1)
                near.append(provider)

        near.sort(key=lambda provider: provider.distance_miles)
        return near
