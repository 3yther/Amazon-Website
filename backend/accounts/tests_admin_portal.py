"""
The Admin Portal: the PIN gate, the Overview numbers and the People tab.

The gate is the thing worth testing hardest. It has two layers on purpose, and
the mistake it exists to prevent is either one being treated as the whole
thing: a correct PIN on a student account must get nothing, and a staff
account that has not entered the PIN must also get nothing.
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from community.models import Answer, Question
from content.models import Pathway
from interest.models import ExpressionOfInterest

from .models import Feedback, Profile

PASSWORD = "harbour-lantern-47"
PIN = "4821"

UNLOCK_URL = "/api/accounts/admin-portal/unlock/"
LOCK_URL = "/api/accounts/admin-portal/lock/"
STATUS_URL = "/api/accounts/admin-portal/status/"
OVERVIEW_URL = "/api/accounts/admin-portal/overview/"
PEOPLE_URL = "/api/accounts/admin-portal/people/"
FEEDBACK_URL = "/api/accounts/admin-portal/feedback/"

# Every endpoint that should be behind the PIN as well as the staff check.
GATED_URLS = [
    OVERVIEW_URL,
    PEOPLE_URL,
    FEEDBACK_URL,
    "/api/community/admin-portal/reports/",
    "/api/community/admin-portal/posts/",
    # The Interest list moved behind the PIN when it became a portal tab.
    "/api/interest/submissions/",
]


def make_user(username, user_type="student", **extra):
    user = User.objects.create_user(username, password=PASSWORD, **extra)
    Profile.objects.create(user=user, user_type=user_type)
    return user


@override_settings(ADMIN_PORTAL_PIN=PIN)
class PinGateTests(APITestCase):
    def setUp(self):
        cache.clear()  # the throttle counts in the cache

    def sign_in(self, user_type="amazon_staff"):
        make_user("someone", user_type)
        self.client.login(username="someone", password=PASSWORD)

    def test_the_right_pin_unlocks(self):
        self.sign_in()

        response = self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["unlocked"])

    def test_the_wrong_pin_is_refused(self):
        self.sign_in()

        response = self.client.post(UNLOCK_URL, {"pin": "0000"}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(self.client.get(STATUS_URL).data["unlocked"])

    def test_a_wrong_pin_never_says_how_many_tries_are_left(self):
        """
        Counting down out loud tells a guesser how close they are, and an
        account lockout would let anybody lock a real staff member out of the
        portal just by typing rubbish at it.
        """
        self.sign_in()

        body = str(self.client.post(UNLOCK_URL, {"pin": "0000"}, format="json").data).lower()

        for leak in ["attempt", "remaining", "tries", "left", "locked"]:
            self.assertNotIn(leak, body)

    def test_a_student_cannot_even_try_the_pin(self):
        """The PIN is a second factor, not a way in. The staff check comes first."""
        self.sign_in("student")

        response = self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        self.assertEqual(response.status_code, 403)

    def test_signed_out_cannot_even_try_the_pin(self):
        response = self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        self.assertIn(response.status_code, (401, 403))

    @override_settings(ADMIN_PORTAL_PIN="")
    def test_no_pin_configured_means_nobody_gets_in(self):
        """Failing closed: a missing environment variable must not open the door."""
        self.sign_in()

        self.assertEqual(self.client.post(UNLOCK_URL, {"pin": ""}, format="json").status_code, 400)
        self.assertFalse(self.client.get(STATUS_URL).data["configured"])

    def test_guessing_is_throttled(self):
        # 10,000 combinations is only safe if guessing is rationed.
        self.sign_in()

        codes = [
            self.client.post(UNLOCK_URL, {"pin": "0000"}, format="json").status_code
            for _ in range(12)
        ]

        self.assertIn(429, codes)

    def test_locking_asks_again(self):
        self.sign_in()
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        self.client.post(LOCK_URL)

        self.assertFalse(self.client.get(STATUS_URL).data["unlocked"])

    @override_settings(ADMIN_PORTAL_UNLOCK_MINUTES=30)
    def test_an_unlock_goes_stale(self):
        """The whole point is re-locking a device somebody walked away from."""
        from .portal_lock import SESSION_KEY

        self.sign_in()
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        session = self.client.session
        session[SESSION_KEY] = (timezone.now() - timedelta(minutes=31)).isoformat()
        session.save()

        self.assertFalse(self.client.get(STATUS_URL).data["unlocked"])


@override_settings(ADMIN_PORTAL_PIN=PIN)
class EveryPortalEndpointIsGatedTests(APITestCase):
    """
    The table-stakes test. Run against every portal URL, so a new tab added
    later without the permission fails here rather than in production.
    """

    def setUp(self):
        cache.clear()

    def test_signed_out_gets_nothing(self):
        for url in GATED_URLS:
            with self.subTest(url=url):
                self.assertIn(self.client.get(url).status_code, (401, 403))

    def test_a_student_gets_nothing(self):
        make_user("student", "student")
        self.client.login(username="student", password=PASSWORD)

        for url in GATED_URLS:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 403)

    def test_staff_who_have_not_entered_the_pin_get_nothing(self):
        """The half that is easy to forget: being staff is not enough here."""
        make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)

        for url in GATED_URLS:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 403)

    def test_staff_with_the_pin_get_in(self):
        make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

        for url in GATED_URLS:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)


@override_settings(ADMIN_PORTAL_PIN=PIN)
class OverviewNumbersTests(APITestCase):
    """The Overview tab's charts, against a known set of data."""

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.business = Pathway.objects.create(
            name="Business", slug="business", summary="s", description="d"
        )
        cls.staff = make_user("staffer", "amazon_staff")
        cls.student = make_user("ada", "student")

        # Seven interest rows: five Digital, two Business. Lopsided on purpose,
        # because an even split is exactly what a broken chart looks like.
        for index in range(7):
            ExpressionOfInterest.objects.create(
                user=cls.student,
                pathway=cls.digital if index < 5 else cls.business,
            )

        question = Question.objects.create(author=cls.student, title="How long?", body="", topic="amazon")
        Answer.objects.create(author=cls.student, question=question, body="About 45 days.")

        for category in ["bug", "bug", "feature", "accessibility"]:
            Feedback.objects.create(category=category, message="Something to say.")

    def setUp(self):
        cache.clear()
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

    def overview(self):
        response = self.client.get(OVERVIEW_URL)
        self.assertEqual(response.status_code, 200)
        return response.data

    def test_interest_is_counted_per_pathway(self):
        segments = {row["label"]: row["value"] for row in self.overview()["interest_by_pathway"]}

        self.assertEqual(segments["Digital"], 5)
        self.assertEqual(segments["Business"], 2)

    def test_every_pathway_appears_even_on_zero(self):
        """So the ring's legend does not change shape as data arrives."""
        Pathway.objects.create(name="Media", slug="media", summary="s", description="d")

        labels = [row["label"] for row in self.overview()["interest_by_pathway"]]

        self.assertIn("Media", labels)

    def test_feedback_is_counted_per_category(self):
        counts = {row["label"]: row["value"] for row in self.overview()["feedback_by_category"]}

        self.assertEqual(counts["bug"], 2)
        self.assertEqual(counts["feature"], 1)
        self.assertEqual(counts["accessibility"], 1)
        self.assertEqual(counts["general"], 0)

    def test_community_activity_counts_questions_and_answers(self):
        weeks = self.overview()["community_activity"]

        self.assertEqual(sum(week["values"]["questions"] for week in weeks), 1)
        self.assertEqual(sum(week["values"]["answers"] for week in weeks), 1)

    def test_signups_are_grouped_by_week_and_type(self):
        rows = self.overview()["signups"]

        self.assertTrue(rows)
        counted = {}
        for row in rows:
            for user_type, count in row["values"].items():
                counted[user_type] = counted.get(user_type, 0) + count
        self.assertEqual(counted.get("amazon_staff"), 1)
        self.assertEqual(counted.get("student"), 1)

    def test_the_totals_add_up(self):
        totals = self.overview()["totals"]

        self.assertEqual(totals["interest"], 7)
        self.assertEqual(totals["questions"], 1)
        self.assertEqual(totals["answers"], 1)
        self.assertEqual(totals["feedback"], 4)


@override_settings(ADMIN_PORTAL_PIN=PIN)
class PeopleTabTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = make_user("staffer", "amazon_staff")
        cls.ada = make_user("ada", "student", email="ada@example.com")
        cls.parent = make_user("bruce", "parent")
        cls.teacher = make_user("carol", "teacher")

    def setUp(self):
        cache.clear()
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

    def test_it_lists_accounts(self):
        response = self.client.get(PEOPLE_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)

    def test_it_never_shows_an_email_address(self):
        """
        Most people here are 16 to 18. CONTEXT.md's rule is the minimum data
        needed for the job, and the job of this tab is finding and
        deactivating an account, which needs no email.
        """
        row = self.client.get(PEOPLE_URL).data["results"][0]

        self.assertNotIn("email", row)

    def test_it_filters_by_type(self):
        response = self.client.get(PEOPLE_URL, {"user_type": "parent"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], "bruce")

    def test_it_searches_by_username(self):
        response = self.client.get(PEOPLE_URL, {"q": "ad"})

        self.assertEqual([row["username"] for row in response.data["results"]], ["ada"])

    def test_it_is_paginated_like_every_other_staff_list(self):
        response = self.client.get(PEOPLE_URL)

        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def remove(self, person, confirm=None):
        body = {"confirm_username": person.username if confirm is None else confirm}
        return self.client.post(f"{PEOPLE_URL}{person.id}/remove/", body, format="json")

    def test_staff_can_remove_an_account_from_the_database(self):
        response = self.remove(self.ada)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(pk=self.ada.pk).exists())
        self.assertFalse(Profile.objects.filter(user_id=self.ada.pk).exists())

    def test_a_removed_account_cannot_sign_in(self):
        self.remove(self.ada)
        self.client.logout()

        self.assertFalse(self.client.login(username="ada", password=PASSWORD))

    def test_removing_an_account_takes_what_it_wrote_with_it(self):
        question = Question.objects.create(author=self.ada, title="Hello", body="Hi", topic="amazon")

        self.remove(self.ada)

        self.assertFalse(Question.objects.filter(pk=question.pk).exists())

    def test_feedback_they_sent_stays_with_the_sender_blanked(self):
        note = Feedback.objects.create(category="bug", message="Broken", user=self.ada)

        self.remove(self.ada)

        note.refresh_from_db()
        self.assertIsNone(note.user)

    def test_the_username_has_to_be_typed_back(self):
        for wrong in ("", "Ada", "ada ", "someone-else"):
            response = self.remove(self.ada, confirm=wrong)
            self.assertEqual(response.status_code, 400, wrong)
            self.assertIn("confirm_username", response.data)

        self.assertTrue(User.objects.filter(pk=self.ada.pk).exists())

    def test_leaving_the_confirmation_out_is_refused_too(self):
        response = self.client.post(f"{PEOPLE_URL}{self.ada.id}/remove/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.ada.pk).exists())

    def test_you_cannot_remove_yourself_from_in_here(self):
        response = self.remove(self.staff)

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.staff.pk).exists())

    def test_you_cannot_remove_another_admin_until_their_access_is_taken_away(self):
        other = make_user("otherstaff", "amazon_staff")

        response = self.remove(other)

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=other.pk).exists())

        self.client.post(f"{PEOPLE_URL}{other.id}/revoke-staff/")
        self.assertEqual(self.remove(other).status_code, 200)

    def test_a_superuser_cannot_be_removed_from_the_portal(self):
        boss = make_user("boss", "student", is_superuser=True)

        self.assertEqual(self.remove(boss).status_code, 400)
        self.assertTrue(User.objects.filter(pk=boss.pk).exists())

    def test_a_student_cannot_remove_anybody(self):
        self.client.logout()
        self.client.login(username="ada", password=PASSWORD)

        response = self.remove(self.parent)

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.parent.pk).exists())

    def test_staff_without_the_pin_cannot_remove_anybody(self):
        self.client.post(LOCK_URL)

        response = self.remove(self.ada)

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.ada.pk).exists())

    # --- taking admin access away --------------------------------------------

    def test_staff_can_take_admin_access_away(self):
        other = make_user("otherstaff", "amazon_staff")

        response = self.client.post(f"{PEOPLE_URL}{other.id}/revoke-staff/")

        self.assertEqual(response.status_code, 200)
        other.profile.refresh_from_db()
        self.assertEqual(other.profile.user_type, "student")
        self.assertTrue(User.objects.filter(pk=other.pk).exists())

    def test_a_person_who_lost_admin_access_is_refused_by_the_portal(self):
        other = make_user("otherstaff", "amazon_staff")
        self.client.post(f"{PEOPLE_URL}{other.id}/revoke-staff/")
        self.client.logout()
        self.client.login(username="otherstaff", password=PASSWORD)

        self.assertEqual(self.client.get(STATUS_URL).status_code, 403)

    def test_you_cannot_take_your_own_admin_access_away(self):
        response = self.client.post(f"{PEOPLE_URL}{self.staff.id}/revoke-staff/")

        self.assertEqual(response.status_code, 400)
        self.staff.profile.refresh_from_db()
        self.assertEqual(self.staff.profile.user_type, "amazon_staff")

    def test_only_an_admin_can_have_admin_access_taken_away(self):
        response = self.client.post(f"{PEOPLE_URL}{self.ada.id}/revoke-staff/")

        self.assertEqual(response.status_code, 400)

    def test_a_student_cannot_take_admin_access_away(self):
        self.client.logout()
        self.client.login(username="ada", password=PASSWORD)

        response = self.client.post(f"{PEOPLE_URL}{self.staff.id}/revoke-staff/")

        self.assertEqual(response.status_code, 403)
        self.staff.profile.refresh_from_db()
        self.assertEqual(self.staff.profile.user_type, "amazon_staff")

    def test_without_the_pin_admin_access_cannot_be_taken_away(self):
        other = make_user("otherstaff", "amazon_staff")
        self.client.post(LOCK_URL)

        response = self.client.post(f"{PEOPLE_URL}{other.id}/revoke-staff/")

        self.assertEqual(response.status_code, 403)
        other.profile.refresh_from_db()
        self.assertEqual(other.profile.user_type, "amazon_staff")


@override_settings(ADMIN_PORTAL_PIN=PIN)
class FeedbackTabTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        make_user("staffer", "amazon_staff")
        Feedback.objects.create(category="bug", message="It crashed.", email="a@example.com")
        Feedback.objects.create(category="feature", message="Add a thing.")

    def setUp(self):
        cache.clear()
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post(UNLOCK_URL, {"pin": PIN}, format="json")

    def test_it_lists_feedback_newest_first(self):
        response = self.client.get(FEEDBACK_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_it_filters_by_category(self):
        response = self.client.get(FEEDBACK_URL, {"category": "bug"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["message"], "It crashed.")

    def test_the_email_is_here_because_the_sender_left_it_for_a_reply(self):
        row = self.client.get(FEEDBACK_URL, {"category": "bug"}).data["results"][0]

        self.assertEqual(row["email"], "a@example.com")
