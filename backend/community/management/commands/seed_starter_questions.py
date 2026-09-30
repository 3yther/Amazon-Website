"""
Puts a set of opening questions on the Community page.

    python manage.py seed_starter_questions
    python manage.py seed_starter_questions --remove

WHY THIS EXISTS. An empty Community page tells a first visitor that nobody
uses this and there is no point asking. A page with real questions on it tells
them what sort of thing to ask.

WHAT IT IS NOT. It does not invent students. Every question is posted by one
visible account, the T-SMILE team, and every one is marked as a starter
question on the page. No fake names, no fake ages, no fake schools, no
answers and no invented "helpful" counts: the whole value of the Community
page is that what is on it is real, and seeding it with imaginary people
would spend that to look busy.

THESE ARE QUESTIONS, NOT ANSWERS. They are posted with nothing under them, on
purpose, so that real students, teachers and staff answer them. That is also
why none of them states a fact: a question cannot be wrong about the world,
and this command is not the place to publish claims about pay, UCAS points or
dates. Anything that reads as an assertion has been reworded until it does
not.

NOT RUN ON DEPLOY. It is run by hand, once, on an environment that wants the
questions (see DEPLOYMENT.md). It is safe to run again: a question whose
title is already there is skipped.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Profile
from community.models import Question, Topic

#: The account the questions are posted by. Staff, so the page is honest about
#: where they came from, and so staff moderation tools already cover them.
TEAM_USERNAME = "tsmile.team"
TEAM_FIRST_NAME = "T-SMILE"
TEAM_LAST_NAME = "Team"

#: (title, body, topic). English only: these are content, not interface, and
#: the site's other languages are machine translations of the interface. Only
#: the "Starter question" label is translated.
STARTERS = [
    (
        "What is a T-Level, and how is it different from A-levels or an apprenticeship?",
        "Trying to understand where a T-Level sits next to the other options after GCSEs.",
        Topic.TLEVELS,
    ),
    (
        "How does the industry placement work, and is it paid?",
        "What the placement involves day to day, and whether employers pay for it.",
        Topic.PLACEMENTS,
    ),
    (
        "What can I do after a T-Level: university, an apprenticeship or a job?",
        "Where people actually go after finishing one, and whether all three stay open.",
        Topic.CHOOSING,
    ),
    (
        "How many UCAS points is a T-Level worth?",
        "And whether universities treat them the same way as A-level points.",
        Topic.CHOOSING,
    ),
    (
        "How do I choose between the Digital, Engineering, Business, Finance and Media pathways?",
        "What helped you decide, if you were not sure at the start.",
        Topic.CHOOSING,
    ),
    (
        "What should I ask at a T-Level open day?",
        "The questions people wish they had asked before choosing.",
        Topic.CHOOSING,
    ),
    (
        "How do I find placement providers near me?",
        "Where to start looking, and who to ask at school or college.",
        Topic.PLACEMENTS,
    ),
    (
        "What subjects do I need at GCSE to start a T-Level?",
        "Whether the requirements differ between pathways and providers.",
        Topic.CHOOSING,
    ),
    (
        "How do I prepare for an interview for an industry placement?",
        "What employers ask, and what is worth practising beforehand.",
        Topic.PLACEMENTS,
    ),
    (
        "What is the Core component and the Occupational Specialism?",
        "How the two parts of a T-Level fit together and how each is assessed.",
        Topic.STUDY,
    ),
    (
        "Can I change T-Level pathway after I have started?",
        "Whether anybody has moved pathway, and how it worked out.",
        Topic.CHOOSING,
    ),
    (
        "What support is available for students with additional needs on a T-Level?",
        "Including on the industry placement, not just in class.",
        Topic.TLEVELS,
    ),
]


def team_account():
    """The account the starters are posted by, made once if it is not there."""
    user, made = User.objects.get_or_create(
        username=TEAM_USERNAME,
        defaults={"first_name": TEAM_FIRST_NAME, "last_name": TEAM_LAST_NAME},
    )
    if made:
        # No usable password: this account exists to be an author, and nobody
        # signs in as it. set_unusable_password is Django's own way of saying
        # that, and it means no password to leak or guess.
        user.set_unusable_password()
        user.save(update_fields=["password"])

    Profile.objects.update_or_create(
        user=user, defaults={"user_type": Profile.UserType.AMAZON_STAFF}
    )
    return user


class Command(BaseCommand):
    help = "Post the Community page's starter questions (safe to run more than once)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--remove",
            action="store_true",
            help="Delete the starter questions instead, and nothing else.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["remove"]:
            return self.remove()
        return self.add()

    def add(self):
        author = team_account()
        added = 0

        for title, body, topic in STARTERS:
            # Idempotent by title: running this twice must not double the page.
            _, made = Question.objects.get_or_create(
                title=title,
                defaults={
                    "author": author,
                    "body": body,
                    "topic": topic,
                    "is_starter": True,
                },
            )
            added += 1 if made else 0

        skipped = len(STARTERS) - added
        self.stdout.write(f"Added {added} starter question(s); {skipped} were already there.")
        if added:
            self.stdout.write(f"Posted as {TEAM_USERNAME}, marked as starter questions.")

    def remove(self):
        """
        Only what this command put there.

        Filtered on the flag, not on the author: a staff member who asks a
        question of their own from the team account should not lose it to a
        cleanup of seeded content.
        """
        gone, _ = Question.objects.filter(is_starter=True).delete()
        self.stdout.write(f"Removed {gone} row(s) for the starter questions.")
