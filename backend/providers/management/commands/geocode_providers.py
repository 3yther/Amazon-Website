"""Fills in each provider's position from its postcode, using postcodes.io.

    python manage.py geocode_providers              only the ones that need it
    python manage.py geocode_providers --refresh    look them all up again
    python manage.py geocode_providers --strict     no retired-postcode fallback

Safe to run any time: by default it only looks up providers still at 0, 0.
Runs in the pre-deploy step after `loaddata providers` (see DEPLOYMENT.md).
Providers it can't place are listed but it still exits 0.

The report at the end matters as much as the lookup. The register is retyped
once a year, and the postcode is the one field that can be checked for free
against an authority, so this splits the outcome three ways:

  placed         a live postcode
  from retired   real, but Royal Mail withdrew it, so the address may be stale
  not found      no such postcode at all: a typo, or invalid on its face
                 (a UK postcode never ends in C, I, K, M, O or V)
"""
from django.core.management.base import BaseCommand

from providers.models import Provider
from providers.postcodes import (
    PostcodeServiceUnavailable,
    lookup_many,
    lookup_terminated,
    normalise,
)


class Command(BaseCommand):
    help = "Fill in provider latitude and longitude from their postcodes (postcodes.io)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--refresh",
            action="store_true",
            help="Look up every provider again, not just the ones with no position.",
        )
        parser.add_argument(
            "--strict",
            action="store_true",
            help="Leave a provider unplaced rather than using a retired postcode's position.",
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

        placed, retired, missing = [], [], []
        # One provider per postcode would be one call per provider, so the
        # retired lookups are cached by postcode too. Several campuses of the
        # same group often share one.
        retired_points = {}

        for provider in providers:
            postcode = normalise(provider.postcode)
            point = points.get(postcode)
            found_retired = False

            if point is None and not options["strict"]:
                if postcode not in retired_points:
                    try:
                        retired_points[postcode] = lookup_terminated(postcode)
                    except PostcodeServiceUnavailable:
                        # The bulk call worked, so this is a blip rather than
                        # an outage. Treat it as "not found" and move on.
                        retired_points[postcode] = None
                point = retired_points[postcode]
                found_retired = point is not None

            if point is None:
                missing.append(provider)
                continue

            provider.latitude, provider.longitude = point
            (retired if found_retired else placed).append(provider)

        changed = placed + retired
        if changed:
            Provider.objects.bulk_update(changed, ["latitude", "longitude"])
        self.stdout.write(self.style.SUCCESS(f"{len(changed)} provider(s) placed on the map."))

        if retired:
            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    f"{len(retired)} placed from a RETIRED postcode. They are searchable, but "
                    "the postcode has been withdrawn, so check the address is still right:"
                )
            )
            for provider in retired:
                self.stdout.write(f"  {provider.postcode}  {provider.name}")

        if missing:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"{len(missing)} postcode(s) not found:"))
            for provider in missing:
                self.stdout.write(f"  {provider.postcode}  {provider.name}")
            self.stdout.write("")
            self.stdout.write("Check these in Django admin. They stay out of the search until fixed.")
