from django.contrib import admin

from .models import Provider


class GeocodedFilter(admin.SimpleListFilter):
    """Whether the near-you search can find this provider. One still at 0, 0
    hasn't been looked up yet, so it's left out of searches.
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
    list_display = [
        "name",
        "postcode",
        "region",
        "provider_type",
        "in_the_search",
        "pathways_confirmed",
        "foundation_year",
    ]
    list_filter = [
        GeocodedFilter,
        "pathways_confirmed",
        "region",
        "provider_type",
        "foundation_year",
        "pathways",
    ]
    search_fields = ["name", "address", "postcode"]
    filter_horizontal = ["pathways"]
    date_hierarchy = "created_at"

    @admin.display(description="In the search", boolean=True)
    def in_the_search(self, provider):
        return (provider.latitude, provider.longitude) != (0, 0)

    # Saying so here saves the next person wondering why a provider added by
    # hand never shows up in the search until the command has run.
    fieldsets = [
        (None, {"fields": ["name", "address", "postcode", "website_url"]}),
        (
            "From the official register",
            {
                "fields": ["region", "provider_type", "foundation_year"],
                "description": (
                    "Straight from the Department for Education's registered providers "
                    "list. Change these only to correct a mistake in it."
                ),
            },
        ),
        (
            "Subjects",
            {
                "fields": ["pathways", "pathways_confirmed"],
                "description": (
                    "The official register does not say which subjects a provider runs, "
                    "only that it runs T-Levels, so most of the list is unconfirmed. "
                    "Tick <strong>pathways confirmed</strong> once someone has actually "
                    "checked: until then an empty list reads as \"not known yet\", and "
                    "the provider is shown to visitors as one to ask rather than as a "
                    "match or a miss."
                ),
            },
        ),
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
