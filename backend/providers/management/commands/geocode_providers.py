"""
Fills in each provider's position from its postcode, using postcodes.io.

    python manage.py geocode_providers              only the ones that need it
    python manage.py geocode_providers --refresh    look every one up again
    python manage.py geocode_providers --strict     do not fall back to retired postcodes

Safe to run as often as you like. By default it only touches providers still
sitting at 0, 0 (the "never looked up" marker), so a second run does nothing
and costs nothing. That is what makes it safe in the pre-deploy step, after
`loaddata providers` (see DEPLOYMENT.md).

Why this exists at all: the search must never call an outside service once per
provider. Doing the lookups here, once, means a visitor's search costs one
call for their own postcode and no more.

THE REPORT AT THE END IS THE POINT AS MUCH AS THE LOOKUP IS.

The provider list is retyped from a spreadsheet once a year, and a postcode is
the one field in it that can be checked for free, automatically, against an
authority. So this says out loud which ones did not check out, in three
groups, because they mean three different things:

  placed                 a live postcode, nothing to see here
  placed from a retired postcode   real, but withdrawn by Royal Mail, so the
                         address behind it may have moved; worth a look
  not found              no such postcode, live or retired: a typo, or an
                         invalid one (UK postcodes never end in C, I, K, M, O
                         or V), and the provider stays out of the search

A provider that cannot be placed is left alone and named in the output, and
the command still exits 0. The seed fixture ships real coordinates, so a
deploy is never blocked by somebody else's API being down; anything left
unplaced is simply left out of the search until the next run.
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
