from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.test import APITestCase

from content.models import Pathway

from .models import ExpressionOfInterest

URL = "/api/interest/"


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
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 405)

    def test_rate_limit(self):
        for _ in range(10):
            self.client.post(URL, self.valid_payload(), format="json")
        response = self.client.post(URL, self.valid_payload(), format="json")
        self.assertEqual(response.status_code, 429)
