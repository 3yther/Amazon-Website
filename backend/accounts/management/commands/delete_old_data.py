"""Deletes old personal data, matching "How long we keep it" on the Privacy page.

    python manage.py delete_old_data            delete it
    python manage.py delete_old_data --dry-run  just say how much would go

Chat messages go after 90 days, interest forms and feedback after 12 months.
Accounts and Community posts stay until someone deletes them.
Run it once a day (e.g. a Railway cron job).
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Feedback
from chatbot.models import ChatMessage
from interest.models import ExpressionOfInterest

# If you change these, change the Privacy page too (frontend/src/legalContent.js).
KEEP = [
    ("chat messages", ChatMessage, "created_at", 90),
    ("interest forms", ExpressionOfInterest, "submitted_at", 365),
    ("feedback messages", Feedback, "created_at", 365),
]


class Command(BaseCommand):
    help = "Delete chat messages, interest forms and feedback older than the Privacy page says we keep them."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Only count, don't delete.")

    def handle(self, *args, dry_run=False, **options):
        now = timezone.now()
        for name, model, field, days in KEEP:
            old = model.objects.filter(**{f"{field}__lt": now - timedelta(days=days)})
            if dry_run:
                self.stdout.write(f"{old.count()} {name} older than {days} days would be deleted.")
            else:
                deleted, _ = old.delete()
                self.stdout.write(f"Deleted {deleted} {name} older than {days} days.")
