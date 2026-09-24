"""
Fills in each provider's position from its postcode, using postcodes.io.

    python manage.py geocode_providers              only the ones that need it
    python manage.py geocode_providers --refresh    look every one up again

Safe to run as often as you like. By default it only touches providers still
sitting at 0, 0 (the "never looked up" marker), so a second run does nothing
and costs nothing. That is what makes it safe in the pre-deploy step, after
`loaddata providers` (see DEPLOYMENT.md).

Why this exists at all: the search must never call an outside service once per
provider. Doing the lookups here, once, means a visitor's search costs one
call for their own postcode and no more.

A provider that cannot be placed is left alone and named in the output, and
the command still exits 0. The seed fixture ships real coordinates, so a
deploy is never blocked by somebody else's API being down; anything left
unplaced is simply left out of the search until the next run.
"""
from django.core.management.base import BaseCommand

from providers.models import Provider
from providers.postcodes import PostcodeServiceUnavailable, lookup_many, normalise


class Command(BaseCommand):
    help = "Fill in provider latitude and longitude from their postcodes (postcodes.io)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--refresh",
            action="store_true",
            help="Look up every provider again, not just the ones with no position.",
        )

    def handle(self, *args, **options):
        providers = Provider.objects.all()
        if not options["refresh"]:
            providers = providers.filter(latitude=0, longitude=0)
        providers = list(providers)

        if not providers:
            self.stdout.write(self.style.SUCCESS("Every provider already has a position."))
            return

        self.stdout.write(f"Looking up {len(providers)} provider(s) on postcodes.io.")

        try:
            points = lookup_many(provider.postcode for provider in providers)
        except PostcodeServiceUnavailable as error:
            # Warn rather than fail: this is enrichment, not a migration, and
            # blocking a deploy on a third party's outage helps nobody.
            self.stderr.write(self.style.WARNING(f"{error} Nothing changed; run this again later."))
            return

        placed, missing = [], []
        for provider in providers:
            point = points.get(normalise(provider.postcode))
            if point is None:
                missing.append(provider)
                continue
            provider.latitude, provider.longitude = point
            placed.append(provider)

        if placed:
            Provider.objects.bulk_update(placed, ["latitude", "longitude"])
        self.stdout.write(self.style.SUCCESS(f"{len(placed)} provider(s) placed on the map."))

        if missing:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"{len(missing)} postcode(s) not found:"))
            for provider in missing:
                self.stdout.write(f"  {provider.postcode}  {provider.name}")
            self.stdout.write("")
            self.stdout.write("Check these in Django admin. They stay out of the search until fixed.")
