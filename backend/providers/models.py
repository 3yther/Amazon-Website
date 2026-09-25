"""Schools and colleges that offer T-Levels. Schema follows MODELS.md exactly."""
from django.db import models


class Region(models.TextChoices):
    """
    The nine English regions the Department for Education's provider list uses.

    A fixed set, so it is worth pinning: the source spreadsheet is retyped
    every year, and a region quietly arriving as "Yorks & Humber" would split
    one region into two in the admin filter without anything failing.
    """

    EAST_MIDLANDS = "East Midlands", "East Midlands"
    EAST_OF_ENGLAND = "East of England", "East of England"
    LONDON = "London", "London"
    NORTH_EAST = "North East", "North East"
    NORTH_WEST = "North West", "North West"
    SOUTH_EAST = "South East", "South East"
    SOUTH_WEST = "South West", "South West"
    WEST_MIDLANDS = "West Midlands", "West Midlands"
    YORKSHIRE = "Yorkshire and the Humber", "Yorkshire and the Humber"


class ProviderType(models.TextChoices):
    """
    What kind of institution this is, in the source list's own words.

    Pinned for the same reason as Region, and with more cause: the January
    2026 spreadsheet spells one of these three different ways ("Sixth Form
    College", "Sixth form college", "University Technical college"). The
    fixture builder folds those together into the spellings here.
    """

    ACADEMY = "Academy", "Academy"
    AGRICULTURAL = "Agricultural and Horticultural College", "Agricultural and Horticultural College"
    ART_AND_DESIGN = "Art and Design College", "Art and Design College"
    GENERAL_FE = "General FE and Tertiary College", "General FE and Tertiary College"
    HIGHER_EDUCATION = "Higher Education Institution", "Higher Education Institution"
    INDEPENDENT = "Independent Learning Provider", "Independent Learning Provider"
    LOCAL_AUTHORITY = "Local Authority", "Local Authority"
    MAINTAINED_SIXTH_FORM = (
        "Local Authority Maintained School Sixth Form",
        "Local Authority Maintained School Sixth Form",
    )
    SIXTH_FORM = "Sixth Form College", "Sixth Form College"
    SPECIAL_POST_16 = "Special Post-16 Institution", "Special Post-16 Institution"
    UTC = "University Technical College", "University Technical College"


class ProviderQuerySet(models.QuerySet):
    def geocoded(self):
        """Only providers that have been placed on the map (0, 0 means not looked up yet)."""
        return self.exclude(latitude=0, longitude=0)


class Provider(models.Model):
    """A school or college that offers T-Levels, with its position for the search.
    The position is filled in by the geocode_providers command.
    """

    name = models.CharField(max_length=200)
    # Blank for the handful whose postcode nothing could be learned about.
    # The card leaves the line out rather than printing a stray comma.
    address = models.CharField(max_length=255, blank=True)
    postcode = models.CharField(max_length=10)
    region = models.CharField(max_length=30, choices=Region.choices)
    provider_type = models.CharField(max_length=60, choices=ProviderType.choices)
    foundation_year = models.BooleanField(
        default=False,
        help_text="Offers the T-Level Foundation Year, the one-year course taken before a T-Level.",
    )
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
    # THE DIFFERENCE BETWEEN "OFFERS NONE OF OURS" AND "WE HAVE NOT ASKED".
    #
    # An empty pathways list means both things, and they are not the same
    # answer to a visitor. The official register says only THAT a provider
    # runs T-Levels, never which ones, so for most of the list we genuinely
    # do not know. For the smaller number we have checked, an empty list is a
    # real finding.
    #
    # Without this flag the pathway filter has to pick one wrong behaviour:
    # hide every unchecked provider (most of the country vanishes when you
    # choose a pathway) or show them all as matches (we would be claiming
    # they offer something we never looked up). With it, the search can
    # answer the two groups separately and the page can say which is which.
    pathways_confirmed = models.BooleanField(
        default=False,
        help_text=(
            "Tick when the pathways above have actually been checked against the provider. "
            "Left unticked, an empty pathway list reads as \"not known yet\" rather than \"none\"."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ProviderQuerySet.as_manager()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
