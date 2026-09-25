"""Schools and colleges that offer T-Levels. Schema follows MODELS.md exactly."""
from django.db import models


class ProviderQuerySet(models.QuerySet):
    def geocoded(self):
        """
        Only providers that have a real position on the map.

        Latitude and longitude are both zero until geocode_providers has
        resolved the postcode, so that pair is our "not looked up yet"
        marker. Zero, zero is a point in the Atlantic, so leaving those rows
        in would put them thousands of miles from every UK search anyway;
        excluding them says why.
        """
        return self.exclude(latitude=0, longitude=0)


class Provider(models.Model):
    """
    One school or college offering T-Levels, with the position the "near you"
    search measures from.

    The position is worked out once by the geocode_providers management
    command, not on the request path: a visitor's search then costs one
    postcode lookup for their own postcode and no more, however many
    providers we hold.
    """

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    postcode = models.CharField(max_length=10)
    # Six decimal places is about 10cm, far finer than a postcode centroid,
    # so nothing is lost by storing it this way.
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    website_url = models.URLField(max_length=500, blank=True)
    pathways = models.ManyToManyField(
        "content.Pathway",
        related_name="providers",
        blank=True,
        help_text="The pathways this provider offers. Leave empty if we do not know yet.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ProviderQuerySet.as_manager()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
