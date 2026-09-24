from django.contrib import admin

from .models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ["name", "postcode", "latitude", "longitude", "website_url", "created_at"]
    list_filter = ["pathways"]
    search_fields = ["name", "address", "postcode"]
    filter_horizontal = ["pathways"]
    date_hierarchy = "created_at"
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
