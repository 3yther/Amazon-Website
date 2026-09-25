"""Schools and colleges that offer T-Levels. Schema follows MODELS.md exactly."""
from django.db import models


class ProviderQuerySet(models.QuerySet):
    def geocoded(self):
        """Only providers that have been placed on the map (0, 0 means not looked up yet)."""
        return self.exclude(latitude=0, longitude=0)


class Provider(models.Model):
    """A school or college that offers T-Levels, with its position for the search.
    The position is filled in by the geocode_providers command.
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
