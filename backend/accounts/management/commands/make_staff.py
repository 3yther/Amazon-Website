"""
Promotes an existing account to Amazon staff from the command line, instead
of clicking through Django admin every time.

    python manage.py make_staff <username>          promote
    python manage.py make_staff <username> --revoke  demote back to student

Sign-up deliberately never offers Amazon staff (see
accounts.serializers.REGISTRATION_USER_TYPES), so a real person has to make
the change. This command is that "real person" step, done once per new
starter, and safe to run again for the same person (it just reports what the
account already is).

On Railway, run it as a one-off against the deployed database, e.g.:

    railway run python manage.py make_staff amir

or from the Railway dashboard's shell for the backend service.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from ...models import Profile

User = get_user_model()


class Command(BaseCommand):
    help = "Set (or unset) an existing user's Profile.user_type to amazon_staff."

    def add_arguments(self, parser):
        parser.add_argument("username", help="Username of the account to change.")
        parser.add_argument(
            "--revoke",
            action="store_true",
            help="Move the account back to student instead of promoting it.",
        )

    def handle(self, *args, **options):
        username = options["username"]
        revoke = options["revoke"]

        try:
            user = User.objects.select_related("profile").get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f'No user named "{username}".') from exc

        try:
            profile = user.profile
        except Profile.DoesNotExist as exc:
            raise CommandError(
                f'"{username}" has no Profile row (never finished registering?)."'
            ) from exc

        target = Profile.UserType.STUDENT if revoke else Profile.UserType.AMAZON_STAFF

        if profile.user_type == target:
            self.stdout.write(
                self.style.WARNING(f'"{username}" is already {profile.get_user_type_display()}.')
            )
            return

        previous = profile.get_user_type_display()
        with transaction.atomic():
            profile.user_type = target
            profile.save(update_fields=["user_type"])

        self.stdout.write(
            self.style.SUCCESS(
                f'"{username}": {previous} -> {profile.get_user_type_display()}.'
            )
        )
