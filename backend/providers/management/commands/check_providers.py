"""Checks the near-you search has providers to search.

    python manage.py check_providers          report, and fail if it's broken
    python manage.py check_providers --quiet  only print if something's wrong

Runs at the end of the pre-deploy command (see DEPLOYMENT.md), so a deploy
that forgot to load the providers fails instead of going live empty.
"""
from django.core.management.base import BaseCommand

from providers.models import Provider


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

    def handle(self, *args, **options):
        total = Provider.objects.count()
        searchable = Provider.objects.geocoded().count()
        unplaced = total - searchable

        if total and not unplaced:
            if not options["quiet"]:
                self.stdout.write(
                    self.style.SUCCESS(f"{searchable} provider(s) ready to search.")
                )
            return

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
