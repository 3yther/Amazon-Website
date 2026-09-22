from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase

from .models import Profile

CSRF_URL = "/api/accounts/csrf/"
REGISTER_URL = "/api/accounts/register/"
LOGIN_URL = "/api/accounts/login/"
LOGOUT_URL = "/api/accounts/logout/"
ME_URL = "/api/accounts/me/"

PASSWORD = "harbour-lantern-47"


class RegisterApiTests(APITestCase):
    def valid_payload(self, **overrides):
        payload = {
            "username": "ada",
            "password": PASSWORD,
            "password_confirm": PASSWORD,
            "user_type": "student",
        }
        payload.update(overrides)
        return payload

    def test_successful_registration(self):
        response = self.client.post(
            REGISTER_URL, self.valid_payload(pathway_interest="Digital"), format="json"
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="ada")
        self.assertEqual(response.data, {"id": user.id, "username": "ada", "user_type": "student"})
        self.assertTrue(user.check_password(PASSWORD))
        self.assertEqual(user.profile.user_type, "student")
        self.assertEqual(user.profile.pathway_interest, "Digital")

    def test_registration_signs_the_user_in(self):
        self.client.post(REGISTER_URL, self.valid_payload(), format="json")
        self.assertEqual(self.client.get(ME_URL).status_code, 200)

    def test_pathway_interest_is_optional(self):
        response = self.client.post(REGISTER_URL, self.valid_payload(pathway_interest=""), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(User.objects.get().profile.pathway_interest)

    def test_duplicate_username_rejected(self):
        User.objects.create_user("Ada", password=PASSWORD)
        response = self.client.post(REGISTER_URL, self.valid_payload(), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["username"], ["A user with that username already exists."])
        self.assertEqual(User.objects.count(), 1)

    def test_weak_password_rejected(self):
        response = self.client.post(
            REGISTER_URL, self.valid_payload(password="123", password_confirm="123"), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertFalse(User.objects.exists())

    def test_password_like_username_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_payload(
                username="lovelace1815", password="lovelace1815", password_confirm="lovelace1815"
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_mismatched_password_confirm_rejected(self):
        response = self.client.post(
            REGISTER_URL, self.valid_payload(password_confirm="harbour-lantern-48"), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"password_confirm"})

    def test_amazon_staff_registration_rejected(self):
        response = self.client.post(
            REGISTER_URL, self.valid_payload(user_type="amazon_staff"), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"user_type"})
        self.assertFalse(User.objects.exists())

    def test_missing_fields_rejected(self):
        response = self.client.post(REGISTER_URL, {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            set(response.data), {"username", "password", "password_confirm", "user_type"}
        )

    def test_password_errors_arrive_with_other_field_errors(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_payload(user_type="amazon_staff", password="123", password_confirm="123"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"user_type", "password"})
        self.assertFalse(User.objects.exists())

    def test_password_confirm_error_arrives_with_other_field_errors(self):
        payload = self.valid_payload(password="123", password_confirm="124")
        del payload["user_type"]  # what the form sends when no account type is chosen
        response = self.client.post(REGISTER_URL, payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"user_type", "password", "password_confirm"})


class SessionApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=cls.user, user_type="teacher", pathway_interest="Media")

    def test_successful_login(self):
        response = self.client.post(
            LOGIN_URL, {"username": "ada", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"id": self.user.id, "username": "ada", "user_type": "teacher"})
        self.assertEqual(int(self.client.session["_auth_user_id"]), self.user.id)

    def test_wrong_password_rejected_with_generic_error(self):
        wrong_password = self.client.post(
            LOGIN_URL, {"username": "ada", "password": "not-the-password"}, format="json"
        )
        unknown_user = self.client.post(
            LOGIN_URL, {"username": "nobody", "password": "not-the-password"}, format="json"
        )
        self.assertEqual(wrong_password.status_code, 400)
        self.assertEqual(wrong_password.data, {"non_field_errors": ["Invalid username or password."]})
        self.assertEqual(unknown_user.data, wrong_password.data)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_inactive_user_cannot_log_in(self):
        User.objects.filter(pk=self.user.pk).update(is_active=False)
        response = self.client.post(
            LOGIN_URL, {"username": "ada", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_logout_clears_the_session(self):
        self.client.login(username="ada", password=PASSWORD)
        response = self.client.post(LOGOUT_URL)
        self.assertEqual(response.status_code, 204)
        self.assertNotIn("_auth_user_id", self.client.session)
        self.assertEqual(self.client.get(ME_URL).status_code, 401)

    def test_logout_needs_a_session(self):
        self.assertEqual(self.client.post(LOGOUT_URL).status_code, 401)

    def test_me_returns_401_when_signed_out(self):
        self.assertEqual(self.client.get(ME_URL).status_code, 401)

    def test_me_returns_current_user_when_signed_in(self):
        self.client.login(username="ada", password=PASSWORD)
        response = self.client.get(ME_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"id": self.user.id, "username": "ada", "user_type": "teacher", "pathway_interest": "Media"},
        )


class CsrfApiTests(APITestCase):
    """The React app must send the token from /csrf/ in X-CSRFToken on every POST."""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=cls.user, user_type="parent")

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def credentials(self):
        return {"username": "ada", "password": PASSWORD}

    def test_login_without_token_rejected(self):
        response = self.client.post(LOGIN_URL, self.credentials(), format="json")
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_register_without_token_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            {"username": "grace", "password": PASSWORD, "password_confirm": PASSWORD, "user_type": "student"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(User.objects.filter(username="grace").exists())

    def test_logout_without_token_rejected(self):
        self.client.login(username="ada", password=PASSWORD)
        self.assertEqual(self.client.post(LOGOUT_URL).status_code, 403)

    def test_full_flow_with_tokens(self):
        token = self.client.get(CSRF_URL).data["csrf_token"]
        response = self.client.post(LOGIN_URL, self.credentials(), format="json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)

        token = self.client.get(CSRF_URL).data["csrf_token"]  # a new token is issued on login
        response = self.client.post(LOGOUT_URL, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 204)
