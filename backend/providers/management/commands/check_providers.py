"""Checks the near-you search has providers to search.

    python manage.py check_providers          report, and fail if it's broken
    python manage.py check_providers --quiet  only print if something's wrong

Runs at the end of the pre-deploy command (see DEPLOYMENT.md), so a deploy
that forgot to load the providers fails instead of going live empty.

A few unplaced providers is NOT a failure. This used to fail on the first one,
which suited 71 colleges typed in by hand. The official register is 360, and a
few of its postcodes exist at no geocoder (some are typos, some are invalid on
their face: a UK postcode never ends in C, I, K, M, O or V). Failing every
deploy over those would just train everyone to ignore this check. So the bar is
"is the search broken", not "is the data perfect". The unplaced are always
listed; --max-unplaced sets the bar yourself.
"""
from django.core.management.base import BaseCommand

from providers.models import Provider

# Above this share of unplaced providers, something has gone wrong in bulk
# (a geocode step that never ran, a service answering nonsense) rather than a
# few bad rows in the source list.
DEFAULT_MAX_UNPLACED_SHARE = 0.15


class Command(BaseCommand):
    help = "Report how many providers the near-you search can actually return."

    def add_arguments(self, parser):
        parser.add_argument(
            "--quiet",
            action="store_true",
            help="Print nothing when everything is in order.",
        )
        parser.add_argument(
            "--allow-empty",
            action="store_true",
            help="Report an empty table without failing (for a fresh database).",
        )
        parser.add_argument(
            "--max-unplaced",
            type=int,
            default=None,
            help=(
                "Fail if more than this many providers have no position. "
                f"Default: {DEFAULT_MAX_UNPLACED_SHARE:.0%} of the table."
            ),
        )

    def handle(self, *args, **options):
        total = Provider.objects.count()
        searchable = Provider.objects.geocoded().count()
        unplaced = total - searchable

        if total == 0:
            self.stderr.write(
                self.style.ERROR(
                    "No providers at all. Every near-you search will answer "
                    "\"none found\" however wide the radius."
                )
            )
            self.stderr.write("Load them with: python manage.py loaddata providers")
            if options["allow_empty"]:
                return
            raise SystemExit(1)

        allowed = options["max_unplaced"]
        if allowed is None:
            allowed = int(total * DEFAULT_MAX_UNPLACED_SHARE)

        if not unplaced:
            if not options["quiet"]:
                self.stdout.write(self.style.SUCCESS(f"{searchable} provider(s) ready to search."))
            return

        # Enough to search with, and only the known-bad postcodes missing.
        if searchable and unplaced <= allowed:
            if not options["quiet"]:
                self.stdout.write(self.style.SUCCESS(f"{searchable} provider(s) ready to search."))
                self.stdout.write(
                    self.style.WARNING(
                        f"{unplaced} have no position and are left out of the search "
                        f"(within the {allowed} allowed):"
                    )
                )
                for provider in Provider.objects.filter(latitude=0, longitude=0):
                    self.stdout.write(f"  {provider.postcode}  {provider.name}")
                self.stdout.write("Fix the postcodes in Django admin, then: geocode_providers")
            return

        self.stderr.write(
            self.style.ERROR(
                f"{unplaced} of {total} provider(s) have no position, so the search "
                f"leaves them out. Only {searchable} can be found."
            )
        )
        for provider in Provider.objects.filter(latitude=0, longitude=0)[:10]:
            self.stderr.write(f"  {provider.postcode}  {provider.name}")
        self.stderr.write("Place them with: python manage.py geocode_providers")
        raise SystemExit(1)
