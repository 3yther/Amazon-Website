"""
The Admin Portal's Reported posts tab.

Hide is reversible and everyday. Delete is not, and takes a question's answers
with it, so the interesting tests here are the ones about what delete actually
removes and who is allowed to press it.
"""
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import Profile

from .models import Answer, Question, Report

PASSWORD = "harbour-lantern-47"
PIN = "4821"

UNLOCK_URL = "/api/accounts/admin-portal/unlock/"
LOCK_URL = "/api/accounts/admin-portal/lock/"
REPORTS_URL = "/api/community/admin-portal/reports/"


def make_user(username, user_type="student"):
    user = User.objects.create_user(username, password=PASSWORD)
    Profile.objects.create(user=user, user_type=user_type)
    return user


@override_settings(ADMIN_PORTAL_PIN=PIN)
class ReportedPostsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = make_user("staffer", "amazon_staff")
        cls.author = make_user("ada")
        cls.reporter = make_user("bruce")

        cls.question = Question.objects.create(
            author=cls.author, title="A question about placements", body="Some detail.", topic="amazon"
        )
        cls.answer = Answer.objects.create(
            author=cls.reporter, question=cls.question, body="An answer."
        )
        cls.question_report = Report.objects.create(
            reporter=cls.reporter, question=cls.question, reason="unkind", note="Not on."
        )
        cls.answer_report = Report.objects.create(
            reporter=cls.author, answer=cls.answer, reason="spam"
        )

    def setUp(self):
        cache.clear()
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

    def act(self, report, action):
        return self.client.post(f"{REPORTS_URL}{report.id}/{action}/")

    # --- reading ------------------------------------------------------------

    def test_it_lists_reports_with_the_post_flattened_onto_them(self):
        """
        The tab should not have to care whether it is looking at a question or
        an answer: both arrive with a kind, some text and an author.
        """
        response = self.client.get(REPORTS_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        kinds = {row["kind"] for row in response.data["results"]}
        self.assertEqual(kinds, {"question", "answer"})
        for row in response.data["results"]:
            self.assertTrue(row["body"])
            self.assertTrue(row["author"])

    def test_it_filters_to_the_ones_still_open(self):
        self.question_report.resolved = True
        self.question_report.save(update_fields=["resolved"])

        response = self.client.get(REPORTS_URL, {"resolved": "false"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["kind"], "answer")

    # --- hide and restore ---------------------------------------------------

    def test_hiding_a_post_takes_it_down_and_closes_the_report(self):
        response = self.act(self.question_report, "hide")

        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.question_report.refresh_from_db()
        self.assertTrue(self.question.hidden)
        self.assertTrue(self.question_report.resolved)

    def test_hiding_keeps_the_post_in_the_database(self):
        """Hide is reversible. That is the whole difference from delete."""
        self.act(self.question_report, "hide")

        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())

    def test_restoring_puts_it_back(self):
        self.act(self.question_report, "hide")

        self.act(self.question_report, "restore")

        self.question.refresh_from_db()
        self.assertFalse(self.question.hidden)
        self.assertEqual(self.question.hidden_reason, "")

    def test_an_answer_can_be_hidden_too(self):
        self.act(self.answer_report, "hide")

        self.answer.refresh_from_db()
        self.assertTrue(self.answer.hidden)

    # --- delete -------------------------------------------------------------

    def test_deleting_a_question_takes_its_answers_with_it(self):
        """
        The model already cascades; this pins that the action actually relies
        on it, so an answer cannot outlive the question it belongs to.
        """
        response = self.act(self.question_report, "delete")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["answers_deleted"], 1)
        self.assertFalse(Question.objects.filter(pk=self.question.pk).exists())
        self.assertFalse(Answer.objects.filter(pk=self.answer.pk).exists())

    def test_deleting_takes_the_reports_with_it_too(self):
        self.act(self.question_report, "delete")

        self.assertFalse(Report.objects.filter(pk=self.question_report.pk).exists())

    def test_deleting_an_answer_leaves_its_question_alone(self):
        self.act(self.answer_report, "delete")

        self.assertFalse(Answer.objects.filter(pk=self.answer.pk).exists())
        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())

    def test_acting_on_a_post_that_has_already_gone_is_a_404_not_a_crash(self):
        self.question.delete()

        # The report went with it, so this is the "somebody else got there
        # first" case two staff members can easily create between them.
        self.assertEqual(self.act(self.question_report, "hide").status_code, 404)

    # --- who is allowed -----------------------------------------------------

    def test_a_student_cannot_delete_a_post(self):
        self.client.logout()
        self.client.login(username="ada", password=PASSWORD)

        response = self.act(self.question_report, "delete")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())

    def test_staff_without_the_pin_cannot_delete_a_post(self):
        self.client.post(LOCK_URL)

        response = self.act(self.question_report, "delete")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())

    def test_signed_out_cannot_delete_a_post(self):
        self.client.logout()

        response = self.act(self.question_report, "delete")

        self.assertIn(response.status_code, (401, 403))
        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())
