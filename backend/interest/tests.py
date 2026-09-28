from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import Profile
from content.models import Pathway

from .models import ExpressionOfInterest

URL = "/api/interest/"
SUBMISSIONS_URL = "/api/interest/submissions/"

PASSWORD = "harbour-lantern-47"


def make_user(username, user_type="student", pathway_interest=None, **fields):
    user = User.objects.create_user(username, password=PASSWORD, **fields)
    Profile.objects.create(user=user, user_type=user_type, pathway_interest=pathway_interest)
    return user


class InterestOptInTests(APITestCase):
    """
    POST /api/interest/, which is now a tick box rather than a form.

    It takes no body at all. Everything stored is copied off the account,
    because the site already held it and asking twice was the complaint.
    """

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )

    def setUp(self):
        cache.clear()  # reset the rate limit between tests

    def sign_in(self, **kwargs):
        user = make_user("ada", **kwargs)
        self.client.login(username="ada", password=PASSWORD)
        return user

    def test_ticking_the_box_records_the_interest(self):
        self.sign_in(pathway_interest="Digital")

        response = self.client.post(URL, {}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ExpressionOfInterest.objects.count(), 1)

    def test_it_copies_the_account_rather_than_asking(self):
        self.sign_in(
            user_type="teacher",
            pathway_interest="Digital",
            first_name="Ada",
            last_name="Lovelace",
            email="ada@example.com",
        )

        self.client.post(URL, {}, format="json")

        interest = ExpressionOfInterest.objects.get()
        self.assertEqual(interest.full_name, "Ada Lovelace")
        self.assertEqual(interest.email, "ada@example.com")
        self.assertEqual(interest.user_type, "teacher")
        self.assertEqual(interest.pathway, self.digital)
        self.assertEqual(interest.user.username, "ada")

    def test_it_ignores_anything_the_body_tries_to_set(self):
        """
        The old form let the sender choose all of this. It must not any more,
        or the tick box becomes a way to file a submission under someone
        else's name.
        """
        self.sign_in(first_name="Ada", last_name="Lovelace", email="ada@example.com")

        self.client.post(
            URL,
            {
                "full_name": "Somebody Else",
                "email": "spoof@example.com",
                "user_type": "amazon_staff",
                "pathway": "digital",
                "message": "injected",
            },
            format="json",
        )

        interest = ExpressionOfInterest.objects.get()
        self.assertEqual(interest.full_name, "Ada Lovelace")
        self.assertEqual(interest.email, "ada@example.com")
        self.assertEqual(interest.message, "")

    def test_an_account_with_nothing_filled_in_can_still_tick_it(self):
        """
        Sign-up asks for no name, no email and optionally no pathway, so this
        is the ordinary case, not an edge one. The tick still means something.
        """
        self.sign_in()

        response = self.client.post(URL, {}, format="json")

        self.assertEqual(response.status_code, 201)
        interest = ExpressionOfInterest.objects.get()
        self.assertEqual(interest.full_name, "")
        self.assertEqual(interest.email, "")
        self.assertIsNone(interest.pathway)
        self.assertEqual(interest.user.username, "ada")

    def test_a_pathway_the_account_never_chose_is_left_empty(self):
        self.sign_in(pathway_interest=None)

        self.client.post(URL, {}, format="json")

        self.assertIsNone(ExpressionOfInterest.objects.get().pathway)

    def test_a_user_type_we_cannot_record_is_left_blank(self):
        """
        Profile has amazon_staff; an expression of interest does not. Writing
        it in anyway would put a value in the column that its own choices
        forbid.
        """
        self.sign_in(user_type="amazon_staff")

        self.client.post(URL, {}, format="json")

        self.assertEqual(ExpressionOfInterest.objects.get().user_type, "")

    def test_ticking_twice_does_not_file_two(self):
        self.sign_in(pathway_interest="Digital")

        first = self.client.post(URL, {}, format="json")
        second = self.client.post(URL, {}, format="json")

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)  # already on the list
        self.assertEqual(ExpressionOfInterest.objects.count(), 1)

    def test_the_answer_says_what_was_recorded(self):
        self.sign_in(pathway_interest="Digital")

        response = self.client.post(URL, {}, format="json")

        self.assertEqual(response.data["pathway"], "digital")
        self.assertIn("submitted_at", response.data)

    def test_the_answer_never_echoes_personal_details(self):
        self.sign_in(first_name="Ada", last_name="Lovelace", email="ada@example.com")

        response = self.client.post(URL, {}, format="json")

        for personal in ("full_name", "email", "user_type", "message"):
            self.assertNotIn(personal, response.data)

    def test_signing_out_is_not_a_way_in(self):
        """
        The deliberate change: with the fields gone there is nothing left to
        identify an anonymous tick by, so it needs an account. The page says
        so and offers a way to sign in; the API just refuses.
        """
        response = self.client.post(URL, {}, format="json")

        self.assertIn(response.status_code, (401, 403))
        self.assertEqual(ExpressionOfInterest.objects.count(), 0)

    def test_submissions_cannot_be_listed_here(self):
        # The public endpoint never lists submissions, even for staff.
        self.sign_in()

        self.assertEqual(self.client.get(URL).status_code, 405)

    def test_rate_limit(self):
        self.sign_in()

        # Every one after the first is a no-op anyway, but the throttle still
        # has to hold: it is what stops the endpoint being hammered.
        for _ in range(10):
            self.client.post(URL, {}, format="json")
        self.assertEqual(self.client.post(URL, {}, format="json").status_code, 429)


class RecordForTests(APITestCase):
    """ExpressionOfInterest.record_for, straight rather than through the view."""

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )

    def test_it_reports_whether_it_created_one(self):
        user = make_user("ada", pathway_interest="Digital")

        first, created = ExpressionOfInterest.record_for(user)
        again, created_again = ExpressionOfInterest.record_for(user)

        self.assertTrue(created)
        self.assertFalse(created_again)
        self.assertEqual(first.pk, again.pk)

    def test_a_pathway_name_that_no_longer_exists_does_not_crash(self):
        user = make_user("ada", pathway_interest="Digital")
        self.digital.delete()

        interest, _ = ExpressionOfInterest.record_for(user)

        self.assertIsNone(interest.pathway)

    def test_a_user_with_no_profile_at_all_still_works(self):
        user = User.objects.create_user("orphan", password=PASSWORD)

        interest, _ = ExpressionOfInterest.record_for(user)

        self.assertEqual(interest.user, user)
        self.assertEqual(interest.user_type, "")


ADMIN_PIN = "4821"
UNLOCK_URL = "/api/accounts/admin-portal/unlock/"


@override_settings(ADMIN_PORTAL_PIN=ADMIN_PIN)
class StaffSubmissionsListTests(APITestCase):
    """
    The staff-only read path. Everything here is about who is allowed to see
    other people's submitted personal details, so each case is spelled out.

    It is a tab in the Admin Portal now, so staff also have to have entered the
    PIN: sign_in_as does both.
    """

    @classmethod
    def setUpTestData(cls):
        pathway = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.author = make_user(
            "ada", first_name="Ada", last_name="Lovelace", email="ada@example.com"
        )
        ExpressionOfInterest.objects.create(
            full_name="Ada Lovelace",
            email="ada@example.com",
            user_type="student",
            pathway=pathway,
            message="Please tell me more.",
            user=cls.author,
        )

    def setUp(self):
        cache.clear()

    def sign_in_as(self, username, user_type):
        make_user(username, user_type)
        self.client.login(username=username, password=PASSWORD)
        # Staff also need the portal's PIN now. A non-staff account is refused
        # by the unlock endpoint itself, so this changes nothing for them.
        self.client.post(UNLOCK_URL, {"pin": ADMIN_PIN}, format="json")

    def test_anonymous_is_denied(self):
        response = self.client.get(SUBMISSIONS_URL)
        self.assertIn(response.status_code, (401, 403))

    def test_signed_in_student_is_denied(self):
        self.sign_in_as("student", "student")

        response = self.client.get(SUBMISSIONS_URL)
        self.assertEqual(response.status_code, 403)

    def test_signed_in_teacher_is_denied(self):
        self.sign_in_as("teacher", "teacher")

        self.assertEqual(self.client.get(SUBMISSIONS_URL).status_code, 403)

    def test_user_without_a_profile_is_denied_not_crashed(self):
        # Fails closed: a User row with no Profile must not turn into a 500.
        User.objects.create_user("orphan", password=PASSWORD)
        self.client.login(username="orphan", password=PASSWORD)

        self.assertEqual(self.client.get(SUBMISSIONS_URL).status_code, 403)

    def test_amazon_staff_can_list_submissions(self):
        self.sign_in_as("staffer", "amazon_staff")

        response = self.client.get(SUBMISSIONS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_staff_response_includes_the_personal_fields(self):
        self.sign_in_as("staffer", "amazon_staff")

        row = self.client.get(SUBMISSIONS_URL).data["results"][0]
        self.assertEqual(row["full_name"], "Ada Lovelace")
        self.assertEqual(row["email"], "ada@example.com")
        self.assertEqual(row["user_type"], "student")
        self.assertEqual(row["pathway"], "digital")
        self.assertEqual(row["message"], "Please tell me more.")
        self.assertIn("submitted_at", row)

    def test_staff_can_always_see_who_it_was(self):
        """
        The copied fields are optional now, so the username is what makes a
        row identifiable when the account never filled anything in.
        """
        self.sign_in_as("staffer", "amazon_staff")

        row = self.client.get(SUBMISSIONS_URL).data["results"][0]
        self.assertEqual(row["username"], "ada")

    def test_response_is_paginated(self):
        self.sign_in_as("staffer", "amazon_staff")

        response = self.client.get(SUBMISSIONS_URL)
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)
