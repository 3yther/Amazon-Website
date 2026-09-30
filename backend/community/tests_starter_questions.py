"""
The Community page's starter questions.

What is tested hardest here is not that the command works, but the three
promises it makes about what it will NOT do: invent people, publish claims,
and delete anything that is not its own.
"""
from io import StringIO

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase

from accounts.models import Profile
from moderation import check_appropriate

from .management.commands.seed_starter_questions import STARTERS, TEAM_USERNAME
from .models import Answer, Question, Topic
from .moderation import check_post


def run(*args):
    out = StringIO()
    call_command("seed_starter_questions", *args, stdout=out)
    return out.getvalue()


class SeedStarterQuestionsTests(TestCase):
    def test_it_posts_every_starter(self):
        run()

        self.assertEqual(Question.objects.filter(is_starter=True).count(), len(STARTERS))

    def test_running_it_again_adds_nothing(self):
        """It is run by hand on a live site; a second run must be harmless."""
        run()

        output = run()

        self.assertEqual(Question.objects.count(), len(STARTERS))
        self.assertIn("Added 0", output)

    def test_the_author_is_a_visible_staff_account(self):
        """
        Not a fake student. The whole value of the Community page is that
        what is on it is real, and seeding it with imagined people would
        spend that to look busy.
        """
        run()

        author = User.objects.get(username=TEAM_USERNAME)
        self.assertEqual(author.profile.user_type, Profile.UserType.AMAZON_STAFF)
        self.assertEqual(
            {question.author_id for question in Question.objects.all()}, {author.id}
        )

    def test_the_team_account_cannot_be_signed_in_as(self):
        """It exists to be an author. No password to leak or to guess."""
        run()

        self.assertFalse(User.objects.get(username=TEAM_USERNAME).has_usable_password())

    def test_it_invents_no_other_accounts(self):
        run()

        self.assertEqual(User.objects.count(), 1)

    def test_it_writes_no_answers_and_no_helpful_counts(self):
        """Posted unanswered on purpose, so real people answer them."""
        run()

        self.assertEqual(Answer.objects.count(), 0)
        self.assertEqual(
            {question.helpful_marks.count() for question in Question.objects.all()}, {0}
        )

    def test_every_question_is_marked_as_a_starter(self):
        run()

        self.assertFalse(Question.objects.filter(is_starter=False).exists())

    def test_every_question_passes_the_site_own_moderation(self):
        """
        Both layers, the same two every real post goes through: the shared
        appropriateness check and the Community-specific one.
        """
        for title, body, _ in STARTERS:
            with self.subTest(title=title):
                self.assertIsNone(check_post(title, body))
                check_appropriate(title)
                check_appropriate(body)

    def test_every_question_uses_a_real_topic(self):
        valid = {value for value, _ in Topic.choices}

        for title, _, topic in STARTERS:
            with self.subTest(title=title):
                self.assertIn(topic, valid)

    def test_no_title_is_too_long_for_the_column(self):
        limit = Question._meta.get_field("title").max_length

        for title, _, _ in STARTERS:
            with self.subTest(title=title):
                self.assertLessEqual(len(title), limit)

    def test_they_are_all_questions_rather_than_claims(self):
        """
        A question cannot be wrong about the world; a statement can. This
        command is not the place to publish figures about pay, UCAS points or
        dates, so every title ends in a question mark and none of the text
        asserts a number.
        """
        for title, body, _ in STARTERS:
            with self.subTest(title=title):
                self.assertTrue(title.rstrip().endswith("?"), title)
                self.assertFalse(
                    any(character.isdigit() for character in f"{title} {body}"),
                    f"a figure crept into a starter question: {title}",
                )

    def test_remove_deletes_the_starters(self):
        run()

        run("--remove")

        self.assertEqual(Question.objects.count(), 0)

    def test_remove_leaves_everybody_else_alone(self):
        """
        Filtered on the flag, not on the author: a staff member asking a
        question of their own must not lose it to a cleanup of seeded content.
        """
        run()
        team = User.objects.get(username=TEAM_USERNAME)
        theirs = Question.objects.create(
            author=team, title="A real question from a staff member", body="Not seeded."
        )
        somebody = User.objects.create_user("ada", password="harbour-lantern-47")
        Profile.objects.create(user=somebody, user_type=Profile.UserType.STUDENT)
        student = Question.objects.create(author=somebody, title="A student's", body="Mine.")

        run("--remove")

        self.assertTrue(Question.objects.filter(pk=theirs.pk).exists())
        self.assertTrue(Question.objects.filter(pk=student.pk).exists())
        self.assertEqual(Question.objects.count(), 2)

    def test_remove_on_an_empty_site_is_fine(self):
        run("--remove")

        self.assertEqual(Question.objects.count(), 0)

    def test_staff_can_still_delete_one_the_ordinary_way(self):
        """Nothing about a starter question is protected from moderation."""
        run()
        question = Question.objects.filter(is_starter=True).first()

        question.delete()

        self.assertEqual(Question.objects.filter(is_starter=True).count(), len(STARTERS) - 1)

    def test_the_api_says_which_questions_are_starters(self):
        run()

        response = self.client.get("/api/community/questions/")

        self.assertEqual(response.status_code, 200)
        rows = response.json()["results"]
        self.assertTrue(rows)
        self.assertTrue(all(row["is_starter"] for row in rows))
