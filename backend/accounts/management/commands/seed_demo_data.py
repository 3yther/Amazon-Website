"""
Fills a DEVELOPMENT database with realistic-looking fake data.

    python manage.py seed_demo_data
    python manage.py seed_demo_data --clear     remove it again, seed nothing

DO NOT RUN THIS AGAINST A REAL DATABASE. Everything it writes is invented:
made-up accounts, made-up questions, made-up feedback. On Railway or AWS that
would be rubbish mixed in with real people's submissions, and the accounts it
creates are sign-innable.

Two things stop that happening by accident:

  * it refuses to run when DEBUG is False, which is how the deployed settings
    are configured (see DJANGO_DEBUG in .env.example);
  * everything it creates is named with the DEMO_PREFIX below, so --clear and
    the re-seed can find exactly what this command made and nothing else.

Safe to run repeatedly: it clears its own previous batch first, so you get the
same shape of data rather than five copies of it. Real accounts and real posts
are never touched, because nothing without the prefix is ever selected.

Why it exists: the Admin Portal's Overview tab is charts. On an empty
development database every chart is a flat line and it is impossible to tell a
working chart from a broken one.
"""
import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import Feedback, Profile
from community.models import Answer, Question, Report, Topic
from content.models import Pathway
from interest.models import ExpressionOfInterest

# Every account this command makes starts with this, so it can find its own
# work again and never touch anybody else's.
DEMO_PREFIX = "demo."

WEEKS = 8

FIRST_NAMES = [
    "Ada", "Ravi", "Maya", "Tom", "Priya", "Jamal", "Ella", "Noah", "Zainab",
    "Callum", "Freya", "Omar", "Grace", "Leo", "Amara", "Finn", "Nia", "Jack",
]
LAST_NAMES = [
    "Okafor", "Patel", "Hughes", "Nowak", "Ahmed", "Brennan", "Silva", "Clarke",
    "Mensah", "Whitfield", "Kaur", "Doyle", "Owusu", "Stanton",
]

QUESTIONS = [
    ("How long is the industry placement?", "I am starting in September and want to plan around it."),
    ("Can I do a degree after a T-Level?", "My school says UCAS points but I want to be sure."),
    ("What GCSEs do I need for the Digital pathway?", "I got a 5 in maths, is that enough?"),
    ("Is the placement paid?", "Trying to work out whether I still need a weekend job."),
    ("What is the employer-set project actually like?", "Nobody has really explained this bit."),
    ("Do I have to choose a pathway before I apply?", ""),
    ("How many days a week is the placement?", "Wondering how it fits around lessons."),
    ("Is there a bursary for travel?", "The college is an hour away on two buses."),
    ("What happens if I fail the core exam?", "Can it be resat or is that the year gone?"),
    ("Are T-Levels accepted by all universities?", ""),
    ("How is a T-Level different from an apprenticeship?", "They sound similar to me."),
    ("Can I switch pathway after the first term?", ""),
]
ANSWERS = [
    "It is at least 315 hours, which works out at about 45 days.",
    "Yes, they carry UCAS points. Check the specific course though, some ask for particular subjects.",
    "Mine was two days a week in the second year, but it varies by provider.",
    "Ask your college directly, the arrangements differ quite a bit between them.",
    "I did mine last year and it was genuinely the best part of the course.",
    "There is a bursary, but you have to apply for it and it is means tested.",
    "You can resit the core, but it puts you behind so it is worth preparing properly.",
    "Not all of them, no. Worth checking each university's entry requirements page.",
]
FEEDBACK = {
    "bug": [
        "The sign up page kept crashing on my phone when I pressed the button twice.",
        "The pathway filter on the resources page does not clear properly.",
        "Search on the community page returns nothing even for words I can see.",
    ],
    "feature": [
        "It would help if you could save resources to come back to later.",
        "Could the provider search show which pathways each college actually runs?",
        "A reminder when applications open would be useful.",
    ],
    "general": [
        "Really clear site, much better than the official one for explaining this.",
        "My daughter found this more useful than her school's careers session.",
        "The T-Levels at Amazon page answered the question I actually had.",
    ],
    "accessibility": [
        "The text spacing setting is great, I wish more sites had it.",
        "Some of the small grey labels are hard to read on my screen.",
        "The high contrast mode made the whole thing usable for me, thank you.",
    ],
}


class Command(BaseCommand):
    help = "Fill a development database with fake accounts, posts, interest and feedback."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove the demo data and stop, without seeding a new batch.",
        )
        parser.add_argument(
            "--people",
            type=int,
            default=40,
            help="How many fake accounts to make (default 40).",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError(
                "Refusing to run with DEBUG=False. This writes invented accounts and "
                "posts, which do not belong in a deployed database. If you really "
                "meant to seed a local database, set DJANGO_DEBUG=True in backend/.env."
            )

        random.seed(20260928)  # same data every run, so screenshots stay stable

        removed = self.clear()
        self.stdout.write(f"Removed {removed} demo account(s) and everything attached to them.")
        if options["clear"]:
            return

        pathways = list(Pathway.objects.order_by("name"))
        if not pathways:
            raise CommandError(
                "No pathways loaded, so there is nothing to spread interest across. "
                "Run: python manage.py loaddata pathways"
            )

        with transaction.atomic():
            people = self.make_people(options["people"])
            self.make_interest(people, pathways)
            questions = self.make_community(people, pathways)
            self.make_reports(people, questions)
            self.make_feedback(people)

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self.stdout.write(
            f"  {User.objects.filter(username__startswith=DEMO_PREFIX).count()} accounts, "
            f"{ExpressionOfInterest.objects.count()} interest, "
            f"{Question.objects.count()} questions, "
            f"{Answer.objects.count()} answers, "
            f"{Feedback.objects.count()} feedback, "
            f"{Report.objects.count()} reports"
        )
        self.stdout.write("Every demo account's password is: demo-password-2026")

    def clear(self):
        """
        Delete the previous batch. Only accounts with DEMO_PREFIX, so a real
        account that happens to have posted is never caught up in it. Their
        questions, answers, reports, interest and feedback go with them by the
        models' own CASCADE and SET_NULL rules.
        """
        demo = User.objects.filter(username__startswith=DEMO_PREFIX)
        count = demo.count()
        # Feedback and interest survive their user being deleted (SET_NULL),
        # so the ones this command invented are taken out by hand.
        Feedback.objects.filter(user__in=demo).delete()
        ExpressionOfInterest.objects.filter(user__in=demo).delete()
        demo.delete()
        return count

    def make_people(self, how_many):
        """Accounts across the three types anyone can sign up as, spread over the weeks."""
        types = [Profile.UserType.STUDENT] * 6 + [Profile.UserType.PARENT] * 3 + [
            Profile.UserType.TEACHER
        ] * 2
        pathway_names = ["Digital"] * 7 + ["Business", "Media", "Finance", "Engineering"]

        people = []
        for index in range(how_many):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            username = f"{DEMO_PREFIX}{first.lower()}{last.lower()}{index}"
            user = User.objects.create_user(
                username,
                password="demo-password-2026",
                first_name=first,
                last_name=last,
                email=f"{username}@example.invalid",
            )
            # Spread across the window, with more recent weeks busier, so the
            # sign-ups chart has a shape rather than a flat line.
            weeks_ago = random.choices(range(WEEKS), weights=range(WEEKS, 0, -1))[0]
            user.date_joined = timezone.now() - timedelta(weeks=weeks_ago, days=random.randint(0, 6))
            user.save(update_fields=["date_joined"])

            Profile.objects.create(
                user=user,
                user_type=random.choice(types),
                pathway_interest=random.choice(pathway_names),
            )
            people.append(user)
        return people

    def make_interest(self, people, pathways):
        """
        Expressions of interest, deliberately lopsided towards Digital, because
        a flat five-way split makes the Overview ring look broken rather than
        empty.
        """
        by_name = {pathway.name: pathway for pathway in pathways}
        weighted = (
            ["Digital"] * 14 + ["Business"] * 3 + ["Engineering"] * 2 + ["Media"] + ["Finance"]
        )
        for person in random.sample(people, k=int(len(people) * 0.7)):
            name = random.choice(weighted)
            interest = ExpressionOfInterest.objects.create(
                user=person,
                full_name=person.get_full_name(),
                email=person.email,
                user_type=getattr(person.profile, "user_type", ""),
                pathway=by_name.get(name),
            )
            self._backdate(ExpressionOfInterest, interest.pk, "submitted_at", person.date_joined)

    def make_community(self, people, pathways):
        """Questions and answers spread unevenly over the window."""
        questions = []
        for title, body in QUESTIONS:
            author = random.choice(people)
            weeks_ago = random.choices(range(WEEKS), weights=range(WEEKS, 0, -1))[0]
            when = timezone.now() - timedelta(weeks=weeks_ago, days=random.randint(0, 6))
            question = Question.objects.create(
                author=author,
                title=title,
                body=body,
                topic=random.choice([choice for choice, _ in Topic.choices]),
                pathway=random.choice(pathways + [None]),
            )
            self._backdate(Question, question.pk, "created_at", when)
            questions.append(question)

            for text in random.sample(ANSWERS, k=random.randint(0, 3)):
                answer = Answer.objects.create(
                    author=random.choice(people), question=question, body=text
                )
                self._backdate(
                    Answer, answer.pk, "created_at", when + timedelta(days=random.randint(0, 5))
                )
        return questions

    def make_reports(self, people, questions):
        """A few reports, so the Reported posts tab has something in it."""
        for question in random.sample(questions, k=3):
            Report.objects.create(
                reporter=random.choice(people),
                question=question,
                reason=random.choice([choice for choice, _ in Report.Reason.choices]),
                note="Reported by the demo seed command.",
            )

    def make_feedback(self, people):
        for category, messages in FEEDBACK.items():
            for message in messages:
                person = random.choice(people)
                feedback = Feedback.objects.create(
                    category=category,
                    message=message,
                    email=person.email,
                    user=person,
                )
                self._backdate(
                    Feedback,
                    feedback.pk,
                    "created_at",
                    timezone.now() - timedelta(days=random.randint(0, WEEKS * 7)),
                )

    @staticmethod
    def _backdate(model, pk, field, when):
        """
        auto_now_add ignores anything passed to create(), so the timestamp is
        written afterwards with an UPDATE. Without this every row would land
        in the current week and the charts would have one bar.
        """
        model.objects.filter(pk=pk).update(**{field: when})
