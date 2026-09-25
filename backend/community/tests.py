from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Profile
from content.models import Pathway

from .models import Answer, Helpful, Question, Report
from .moderation import check_post

QUESTIONS = "/api/community/questions/"


def make_user(username, user_type="student", **extra):
    user = User.objects.create_user(username, password="t-smile-test-pw", **extra)
    Profile.objects.create(user=user, user_type=user_type)
    return user


class ModerationTests(APITestCase):
    """What is stopped before it is ever published."""

    def test_ordinary_questions_are_fine(self):
        self.assertIsNone(check_post("How long is the placement at Amazon?", "I start in September."))
        # Whole words only: these contain rude letters but are not rude.
        self.assertIsNone(check_post("Is the assessment hard in Scunthorpe?"))

    def test_personal_details_are_stopped(self):
        for text in [
            "email me at sam@example.com",
            "my number is 07700 900123",
            "I live near SW1A 1AA",
            "add me on snap",
            "follow @sam_2009",
        ]:
            with self.subTest(text=text):
                self.assertEqual(check_post(text), "personal_details")

    def test_links_only_to_official_sites(self):
        self.assertIsNone(check_post("See https://www.gov.uk/topic/further-education-skills"))
        self.assertIsNone(check_post("UCAS points are on ucas.com"))
        self.assertEqual(check_post("Look at www.dodgy-site.com"), "link")

    def test_strong_language_is_stopped(self):
        self.assertEqual(check_post("this is fucking hard"), "strong_language")

    def test_someone_at_risk_is_not_published(self):
        self.assertEqual(check_post("I want to kill myself"), "wellbeing")


class CommunityApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(name="Digital", slug="digital", summary="s", description="d")
        cls.sam = make_user("sam")
        cls.alex = make_user("alex", "parent")
        cls.staff = make_user("amazon_ana", "amazon_staff", is_staff=True)

    def ask(self, user=None, **fields):
        if user:
            self.client.force_login(user)
        payload = {"title": "How long is the Amazon placement?", "body": "", "topic": "amazon", **fields}
        return self.client.post(QUESTIONS, payload, format="json")

    # --- reading and asking -------------------------------------------------

    def test_anyone_can_read_but_only_members_can_ask(self):
        self.assertEqual(self.client.get(QUESTIONS).status_code, 200)
        response = self.ask()
        self.assertEqual(response.status_code, 401)
        self.assertFalse(Question.objects.exists())

    def test_a_member_can_ask(self):
        response = self.ask(self.sam, pathway="digital")
        self.assertEqual(response.status_code, 201)
        question = Question.objects.get()
        self.assertEqual(question.author, self.sam)
        self.assertEqual(question.pathway, self.digital)
        self.assertEqual(response.data["author"], {"username": "sam", "role": "student"})

    def test_a_blocked_question_says_why(self):
        response = self.ask(self.sam, body="text me on 07700 900123")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["moderation"], ["personal_details"])
        self.assertFalse(Question.objects.exists())

    def test_markup_is_stripped(self):
        self.ask(self.sam, title="<b>What GCSEs</b> do I need?")
        self.assertEqual(Question.objects.get().title, "What GCSEs do I need?")

    def test_filters_and_search(self):
        Question.objects.create(author=self.sam, title="Placement question one", body="", topic="placements")
        Question.objects.create(author=self.sam, title="Amazon mentor question", body="", topic="amazon")

        def titles(**params):
            return [q["title"] for q in self.client.get(QUESTIONS, params).data["results"]]

        self.assertEqual(titles(topic="amazon"), ["Amazon mentor question"])
        self.assertEqual(titles(q="mentor"), ["Amazon mentor question"])
        self.assertEqual(self.client.get(QUESTIONS, {"topic": "nonsense"}).status_code, 400)

    def test_unanswered_sort(self):
        answered = Question.objects.create(author=self.sam, title="Answered one here", body="")
        Question.objects.create(author=self.sam, title="Nobody has answered", body="")
        Answer.objects.create(question=answered, author=self.alex, body="Yes")

        results = self.client.get(QUESTIONS, {"sort": "unanswered"}).data["results"]
        self.assertEqual([q["title"] for q in results], ["Nobody has answered"])

    # --- answering ------------------------------------------------------------

    def test_answering_and_the_detail_view(self):
        question = Question.objects.create(author=self.sam, title="What is the placement like?", body="")
        self.client.force_login(self.staff)
        response = self.client.post(f"{QUESTIONS}{question.id}/answers/", {"body": "Nine weeks in a team."})
        self.assertEqual(response.status_code, 201)

        detail = self.client.get(f"{QUESTIONS}{question.id}/").data
        self.assertEqual(detail["answer_count"], 1)
        self.assertEqual(detail["answers"][0]["author"]["role"], "amazon_staff")

    def test_only_the_asker_can_accept_an_answer(self):
        question = Question.objects.create(author=self.sam, title="Do I get paid there?", body="")
        answer = Answer.objects.create(question=question, author=self.alex, body="Ask your provider.")

        self.client.force_login(self.alex)
        self.assertEqual(self.client.post(f"/api/community/answers/{answer.id}/accept/").status_code, 403)

        self.client.force_login(self.sam)
        response = self.client.post(f"/api/community/answers/{answer.id}/accept/")
        self.assertEqual(response.data, {"is_accepted": True})
        answer.refresh_from_db()
        self.assertTrue(answer.is_accepted)

    # --- helpful marks ------------------------------------------------------------

    def test_helpful_toggles_once_per_person_and_not_on_your_own(self):
        question = Question.objects.create(author=self.sam, title="Which pathway suits me?", body="")
        url = f"{QUESTIONS}{question.id}/helpful/"

        self.client.force_login(self.sam)
        self.assertEqual(self.client.post(url).status_code, 400)

        self.client.force_login(self.alex)
        self.assertEqual(self.client.post(url).data, {"found_helpful": True, "helpful_count": 1})
        self.assertEqual(self.client.post(url).data, {"found_helpful": False, "helpful_count": 0})

    # --- reports ----------------------------------------------------------------------

    def test_three_reports_hide_a_post_until_staff_review_it(self):
        question = Question.objects.create(author=self.sam, title="A question someone reports", body="")
        url = f"{QUESTIONS}{question.id}/report/"

        for name in ["r1", "r2"]:
            self.client.force_login(make_user(name))
            self.assertEqual(self.client.post(url, {"reason": "unkind"}).status_code, 201)
        question.refresh_from_db()
        self.assertFalse(question.hidden)

        self.client.force_login(make_user("r3"))
        self.client.post(url, {"reason": "unkind"})
        question.refresh_from_db()
        self.assertTrue(question.hidden)
        self.assertEqual(Report.objects.count(), 3)

        # Hidden from everybody else, still visible to its author.
        self.client.logout()
        self.assertEqual(self.client.get(QUESTIONS).data["count"], 0)
        self.assertEqual(self.client.get(f"{QUESTIONS}{question.id}/").status_code, 404)
        self.client.force_login(self.sam)
        self.assertTrue(self.client.get(f"{QUESTIONS}{question.id}/").data["hidden"])

    def test_reporting_twice_counts_once(self):
        question = Question.objects.create(author=self.sam, title="Reported by one person", body="")
        self.client.force_login(self.alex)
        for _ in range(3):
            self.client.post(f"{QUESTIONS}{question.id}/report/", {"reason": "spam"})
        question.refresh_from_db()
        self.assertFalse(question.hidden)
        self.assertEqual(Report.objects.count(), 1)

    def test_a_staff_report_hides_straight_away(self):
        question = Question.objects.create(author=self.sam, title="Staff will hide this one", body="")
        self.client.force_login(self.staff)
        self.client.post(f"{QUESTIONS}{question.id}/report/", {"reason": "unsafe"})
        question.refresh_from_db()
        self.assertTrue(question.hidden)

    # --- deleting ---------------------------------------------------------------------

    def test_only_the_author_can_delete(self):
        question = Question.objects.create(author=self.sam, title="Only I can delete this", body="")
        self.client.force_login(self.alex)
        self.assertEqual(self.client.delete(f"{QUESTIONS}{question.id}/").status_code, 403)
        self.client.force_login(self.sam)
        self.assertEqual(self.client.delete(f"{QUESTIONS}{question.id}/").status_code, 204)
        self.assertFalse(Question.objects.exists())

    def test_everything_goes_when_the_account_does(self):
        question = Question.objects.create(author=self.sam, title="Deleted with my account", body="")
        Answer.objects.create(question=question, author=self.alex, body="An answer")
        Helpful.objects.create(user=self.alex, question=question)
        self.sam.delete()
        self.assertFalse(Question.objects.exists())
        self.assertFalse(Answer.objects.exists())
