from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APITestCase

from accounts.models import Profile
from content.models import Pathway

from .models import ExpressionOfInterest

URL = "/api/interest/"
SUBMISSIONS_URL = "/api/interest/submissions/"

PASSWORD = "harbour-lantern-47"


class ExpressionOfInterestApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        Pathway.objects.create(name="Digital", slug="digital", summary="s", description="d")

    def setUp(self):
        cache.clear()  # reset the rate limit between tests

    def valid_payload(self, **overrides):
        payload = {
            "full_name": "Ada Lovelace",
            "email": "ada@example.com",
            "user_type": "student",
            "pathway": "digital",
            "message": "",
        }
        payload.update(overrides)
        return payload

    def test_valid_submission_is_saved(self):
        response = self.client.post(
            URL,
            self.valid_payload(full_name="  Jean-Luc   O'Brien ", email="Jean@EXAMPLE.com"),
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        eoi = ExpressionOfInterest.objects.get()
        self.assertEqual(eoi.full_name, "Jean-Luc O'Brien")
        self.assertEqual(eoi.email, "Jean@example.com")
        self.assertIsNone(eoi.user)

    def test_response_does_not_echo_personal_data(self):
        response = self.client.post(URL, self.valid_payload(), format="json")
        self.assertEqual(set(response.data), {"id", "pathway", "submitted_at"})

    def test_missing_fields_are_rejected(self):
        response = self.client.post(URL, {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"full_name", "email", "user_type", "pathway"})

    def test_bad_values_are_rejected(self):
        response = self.client.post(
            URL,
            self.valid_payload(
                full_name="<script>alert(1)</script>",
                email="not-an-email",
                user_type="amazon_staff",
                pathway="unknown",
                message="x" * 2001,
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            set(response.data), {"full_name", "email", "user_type", "pathway", "message"}
        )
        self.assertFalse(ExpressionOfInterest.objects.exists())

    def test_name_with_digits_is_rejected(self):
        response = self.client.post(URL, self.valid_payload(full_name="Ada 123"), format="json")
        self.assertEqual(response.status_code, 400)

    def test_signed_in_user_is_linked(self):
        user = User.objects.create_user("ada", password="x")
        self.client.force_authenticate(user)
        response = self.client.post(URL, self.valid_payload(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ExpressionOfInterest.objects.get().user, user)

    def test_submissions_cannot_be_listed(self):
        # The public endpoint never lists submissions, even for staff.
        # Staff use the separate submissions endpoint.
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 405)

    def test_rate_limit(self):
        for _ in range(10):
            self.client.post(URL, self.valid_payload(), format="json")
        response = self.client.post(URL, self.valid_payload(), format="json")
        self.assertEqual(response.status_code, 429)


class StaffSubmissionsListTests(APITestCase):
    """
    The staff-only read path. Everything here is about who is allowed to see
    other people's submitted personal details, so each case is spelled out.
    """

    @classmethod
    def setUpTestData(cls):
        pathway = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        ExpressionOfInterest.objects.create(
            full_name="Ada Lovelace",
            email="ada@example.com",
            user_type="student",
            pathway=pathway,
            message="Please tell me more.",
        )

    def setUp(self):
        cache.clear()

    def make_user(self, username, user_type):
        user = User.objects.create_user(username, password=PASSWORD)
        Profile.objects.create(user=user, user_type=user_type)
        return user

    def test_anonymous_is_denied(self):
        response = self.client.get(SUBMISSIONS_URL)
        self.assertIn(response.status_code, (401, 403))

    def test_signed_in_student_is_denied(self):
        self.make_user("student", "student")
        self.client.login(username="student", password=PASSWORD)

        response = self.client.get(SUBMISSIONS_URL)
        self.assertEqual(response.status_code, 403)

    def test_signed_in_teacher_is_denied(self):
        self.make_user("teacher", "teacher")
        self.client.login(username="teacher", password=PASSWORD)

        self.assertEqual(self.client.get(SUBMISSIONS_URL).status_code, 403)

    def test_user_without_a_profile_is_denied_not_crashed(self):
        # Fails closed: a User row with no Profile must not turn into a 500.
        User.objects.create_user("orphan", password=PASSWORD)
        self.client.login(username="orphan", password=PASSWORD)

        self.assertEqual(self.client.get(SUBMISSIONS_URL).status_code, 403)

    def test_amazon_staff_can_list_submissions(self):
        self.make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)

        response = self.client.get(SUBMISSIONS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_staff_response_includes_the_personal_fields(self):
        # The public serializer keeps these write_only; staff need to read
        # them, which is the whole point of the separate serializer.
        self.make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)

        row = self.client.get(SUBMISSIONS_URL).data["results"][0]
        self.assertEqual(row["full_name"], "Ada Lovelace")
        self.assertEqual(row["email"], "ada@example.com")
        self.assertEqual(row["user_type"], "student")
        self.assertEqual(row["pathway"], "digital")
        self.assertEqual(row["message"], "Please tell me more.")
        self.assertIn("submitted_at", row)

    def test_response_is_paginated(self):
        self.make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)

        response = self.client.get(SUBMISSIONS_URL)
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_creating_still_echoes_nothing_back(self):
        # The read path must not have loosened the write path.
        response = self.client.post(
            URL,
            {
                "full_name": "Grace Hopper",
                "email": "grace@example.com",
                "user_type": "teacher",
                "pathway": "digital",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        for personal in ("full_name", "email", "user_type", "message"):
            self.assertNotIn(personal, response.data)
