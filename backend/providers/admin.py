from django.contrib import admin

from .models import Provider


class GeocodedFilter(admin.SimpleListFilter):
    """
    Whether a provider can be returned by the near-you search at all.

    A provider still at 0, 0 is left out of every search, and nothing on the
    old list page said so: the two decimal columns read as data rather than as
    "this one is invisible to visitors".
    """

    title = "in the search"
    parameter_name = "geocoded"

    def lookups(self, request, model_admin):
        return [("yes", "Can be found"), ("no", "No position, left out")]

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.geocoded()
        if self.value() == "no":
            return queryset.filter(latitude=0, longitude=0)
        return queryset


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ["name", "postcode", "in_the_search", "latitude", "longitude", "website_url"]
    list_filter = [GeocodedFilter, "pathways"]
    search_fields = ["name", "address", "postcode"]
    filter_horizontal = ["pathways"]
    date_hierarchy = "created_at"

    @admin.display(description="In the search", boolean=True)
    def in_the_search(self, provider):
        return (provider.latitude, provider.longitude) != (0, 0)

    # Saying so here saves the next person wondering why a provider added by
    # hand never shows up in the search until the command has run.
    fieldsets = [
        (None, {"fields": ["name", "address", "postcode", "website_url", "pathways"]}),
        (
            "Position",
            {
                "fields": ["latitude", "longitude"],
                "description": (
                    "Leave both at 0 and run <code>python manage.py geocode_providers</code> "
                    "to fill them in from the postcode. A provider at 0, 0 is left out of the "
                    "near-you search."
                ),
            },
        ),
    ]
