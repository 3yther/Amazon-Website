from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient, APITestCase

from .models import Feedback, Profile, UserPreference

CSRF_URL = "/api/accounts/csrf/"
REGISTER_URL = "/api/accounts/register/"
LOGIN_URL = "/api/accounts/login/"
LOGOUT_URL = "/api/accounts/logout/"
ME_URL = "/api/accounts/me/"
PREFERENCES_URL = "/api/accounts/user-preferences/"
CHANGE_PASSWORD_URL = "/api/accounts/change-password/"
PASSWORD_RESET_URL = "/api/accounts/password-reset/"
PASSWORD_RESET_CONFIRM_URL = "/api/accounts/password-reset/confirm/"
DEACTIVATE_URL = "/api/accounts/deactivate-account/"
FEEDBACK_URL = "/api/accounts/feedback/"

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
        data = response.data
        preferences = data.pop("preferences")
        last_password_changed = data.pop("last_password_changed")
        self.assertEqual(
            data,
            {
                "id": self.user.id,
                "username": "ada",
                "user_type": "teacher",
                "pathway_interest": "Media",
                "first_name": "",
                "last_name": "",
                "email": "",
                "phone": "",
            },
        )
        self.assertIsNotNone(last_password_changed)
        self.assertEqual(preferences["theme"], "system")


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


class UserPreferenceApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=cls.user, user_type="student")

    def setUp(self):
        self.client.login(username="ada", password=PASSWORD)

    def test_signed_out_request_rejected(self):
        self.client.logout()
        self.assertEqual(self.client.get(PREFERENCES_URL).status_code, 401)

    def test_get_creates_defaults_on_first_access(self):
        self.assertFalse(UserPreference.objects.filter(user=self.user).exists())
        response = self.client.get(PREFERENCES_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["font_size_scale"], 100)
        self.assertEqual(response.data["theme"], "system")
        self.assertTrue(UserPreference.objects.filter(user=self.user).exists())

    def test_patch_updates_and_round_trips(self):
        response = self.client.patch(
            PREFERENCES_URL,
            {"font_size_scale": 120, "high_contrast": True, "theme": "dark"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["font_size_scale"], 120)
        self.assertTrue(response.data["high_contrast"])
        self.assertEqual(response.data["theme"], "dark")

        # And it is really saved, not just echoed back.
        response = self.client.get(PREFERENCES_URL)
        self.assertEqual(response.data["font_size_scale"], 120)
        self.assertEqual(response.data["theme"], "dark")

    def test_patch_leaves_other_fields_untouched(self):
        self.client.patch(PREFERENCES_URL, {"language": "es"}, format="json")
        response = self.client.patch(PREFERENCES_URL, {"font_size_scale": 90}, format="json")
        self.assertEqual(response.data["language"], "es")
        self.assertEqual(response.data["font_size_scale"], 90)

    def test_font_size_scale_out_of_range_rejected(self):
        response = self.client.patch(PREFERENCES_URL, {"font_size_scale": 200}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("font_size_scale", response.data)

    def test_text_spacing_level_out_of_range_rejected(self):
        response = self.client.patch(PREFERENCES_URL, {"text_spacing_level": 4}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("text_spacing_level", response.data)

    def test_invalid_choice_rejected(self):
        response = self.client.patch(PREFERENCES_URL, {"theme": "sepia"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("theme", response.data)


class ChangePasswordApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=cls.user, user_type="student")

    def setUp(self):
        self.client.login(username="ada", password=PASSWORD)

    def test_signed_out_request_rejected(self):
        self.client.logout()
        response = self.client.post(CHANGE_PASSWORD_URL, {}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_successful_change(self):
        new_password = "harbour-lantern-48"
        response = self.client.post(
            CHANGE_PASSWORD_URL,
            {
                "current_password": PASSWORD,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))

        # update_session_auth_hash kept this session signed in.
        self.assertEqual(self.client.get(ME_URL).status_code, 200)

        # And a new login with the new password works.
        self.client.logout()
        login_response = self.client.post(
            LOGIN_URL, {"username": "ada", "password": new_password}, format="json"
        )
        self.assertEqual(login_response.status_code, 200)

    def test_wrong_current_password_rejected(self):
        response = self.client.post(
            CHANGE_PASSWORD_URL,
            {
                "current_password": "not-the-password",
                "new_password": "harbour-lantern-48",
                "confirm_password": "harbour-lantern-48",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("current_password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(PASSWORD))

    def test_mismatched_confirm_password_rejected(self):
        response = self.client.post(
            CHANGE_PASSWORD_URL,
            {
                "current_password": PASSWORD,
                "new_password": "harbour-lantern-48",
                "confirm_password": "harbour-lantern-49",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("confirm_password", response.data)

    def test_weak_new_password_rejected(self):
        response = self.client.post(
            CHANGE_PASSWORD_URL,
            {"current_password": PASSWORD, "new_password": "123", "confirm_password": "123"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)


class DeactivateAccountApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=cls.user, user_type="student")

    def setUp(self):
        self.client.login(username="ada", password=PASSWORD)

    def test_signed_out_request_rejected(self):
        self.client.logout()
        response = self.client.post(DEACTIVATE_URL, {"password": PASSWORD}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_wrong_password_rejected(self):
        response = self.client.post(DEACTIVATE_URL, {"password": "not-the-password"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.profile.is_deactivated)

    def test_successful_deactivation_signs_out_and_blocks_login(self):
        response = self.client.post(DEACTIVATE_URL, {"password": PASSWORD}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertTrue(self.user.profile.is_deactivated)
        self.assertIsNotNone(self.user.profile.deactivated_at)

        # The session ended...
        self.assertEqual(self.client.get(ME_URL).status_code, 401)

        # ...and a deactivated account cannot sign back in.
        login_response = self.client.post(
            LOGIN_URL, {"username": "ada", "password": PASSWORD}, format="json"
        )
        self.assertEqual(login_response.status_code, 400)


class FeedbackApiTests(APITestCase):
    def test_anonymous_submission_with_email(self):
        response = self.client.post(
            FEEDBACK_URL,
            {"category": "bug", "message": "The quiz page is blank on Safari.", "email": "ada@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"success": True})

        feedback = Feedback.objects.get()
        self.assertEqual(feedback.category, "bug")
        self.assertEqual(feedback.email, "ada@example.com")
        self.assertIsNone(feedback.user)

    def test_signed_in_submission_links_the_user(self):
        user = User.objects.create_user("ada", password=PASSWORD)
        Profile.objects.create(user=user, user_type="student")
        self.client.login(username="ada", password=PASSWORD)

        response = self.client.post(
            FEEDBACK_URL,
            {"category": "feature", "message": "Add a dark mode toggle to the homepage."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        feedback = Feedback.objects.get()
        self.assertEqual(feedback.user, user)

    def test_email_is_optional(self):
        response = self.client.post(
            FEEDBACK_URL, {"category": "general", "message": "Nice site."}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Feedback.objects.get().email, "")

    def test_missing_message_rejected(self):
        response = self.client.post(FEEDBACK_URL, {"category": "general"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.data)
        self.assertFalse(Feedback.objects.exists())

    def test_invalid_category_rejected(self):
        response = self.client.post(
            FEEDBACK_URL,
            {"category": "not-a-real-category", "message": "Something is wrong."},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("category", response.data)
        self.assertFalse(Feedback.objects.exists())

    def test_no_csrf_token_needed_when_signed_out(self):
        # Unlike the signed-in-only endpoints above, this one has nothing to
        # enforce CSRF on for an anonymous request (see the view's docstring).
        client = APIClient(enforce_csrf_checks=True)
        response = client.post(
            FEEDBACK_URL, {"category": "general", "message": "Works without a token."}, format="json"
        )
        self.assertEqual(response.status_code, 201)


class PasswordResetRequestApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD, email="ada@example.com")
        Profile.objects.create(user=cls.user, user_type="student")

    def setUp(self):
        cache.clear()  # reset the rate limit between tests

    def test_known_username_with_email_sends_one_message(self):
        response = self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["ada@example.com"])
        self.assertIn("/reset-password?uid=", mail.outbox[0].body)

    def test_username_is_case_insensitive(self):
        response = self.client.post(PASSWORD_RESET_URL, {"username": "ADA"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_unknown_username_sends_nothing_but_answers_the_same_way(self):
        known = self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")
        mail.outbox.clear()
        unknown = self.client.post(PASSWORD_RESET_URL, {"username": "nobody-here"}, format="json")

        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_username_with_no_email_on_file_sends_nothing_but_answers_the_same_way(self):
        User.objects.create_user("noemail", password=PASSWORD)
        # Profile is optional here; the view only needs the User to exist.
        response = self.client.post(PASSWORD_RESET_URL, {"username": "noemail"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_deactivated_account_sends_nothing(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_missing_username_is_a_400(self):
        response = self.client.post(PASSWORD_RESET_URL, {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_rate_limit(self):
        for _ in range(5):
            self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")
        response = self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")
        self.assertEqual(response.status_code, 429)

    def test_no_csrf_token_needed_check_is_still_enforced_when_signed_out(self):
        # Unlike feedback, this follows register/login: CSRF is checked even
        # for a signed-out visitor, to block the same "login CSRF" style abuse.
        client = APIClient(enforce_csrf_checks=True)
        response = client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")
        self.assertEqual(response.status_code, 403)


class PasswordResetConfirmApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ada", password=PASSWORD, email="ada@example.com")
        Profile.objects.create(user=cls.user, user_type="student")

    def setUp(self):
        cache.clear()  # reset the rate limit between tests, shared with the request endpoint

    def link_for(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return uid, token

    def test_valid_link_resets_the_password_and_signs_in(self):
        uid, token = self.link_for(self.user)

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": token,
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True})

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-harbour-lantern-9"))
        # The visitor is signed in as themselves, same as after register/login.
        self.assertEqual(self.client.get(ME_URL).status_code, 200)

    def test_token_can_only_be_used_once(self):
        uid, token = self.link_for(self.user)
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "new-harbour-lantern-9",
            "confirm_password": "new-harbour-lantern-9",
        }
        first = self.client.post(PASSWORD_RESET_CONFIRM_URL, payload, format="json")
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {**payload, "new_password": "another-one-2", "confirm_password": "another-one-2"},
            format="json",
        )
        self.assertEqual(second.status_code, 400)
        self.assertIn("token", second.data)

    def test_wrong_token_rejected(self):
        uid, _ = self.link_for(self.user)

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": "not-a-real-token",
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(PASSWORD))

    def test_unreadable_uid_rejected_not_500(self):
        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": "not-base64!!",
                "token": "whatever",
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.data)

    def test_mismatched_passwords_rejected(self):
        uid, token = self.link_for(self.user)

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": token,
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "does-not-match",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirm_password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(PASSWORD))

    def test_weak_password_rejected(self):
        uid, token = self.link_for(self.user)

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {"uid": uid, "token": token, "new_password": "123", "confirm_password": "123"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)

    def test_a_password_change_since_the_link_was_sent_invalidates_it(self):
        # Django's default token generator bakes the password hash into the
        # token, so changing the password (e.g. the account owner remembered
        # it and logged in normally) invalidates any link sent earlier.
        uid, token = self.link_for(self.user)
        self.user.set_password("a-different-password-1")
        self.user.save()

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": token,
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_deactivated_account_rejected(self):
        uid, token = self.link_for(self.user)
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": token,
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_no_csrf_token_needed_check_is_still_enforced_when_signed_out(self):
        uid, token = self.link_for(self.user)
        client = APIClient(enforce_csrf_checks=True)

        response = client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": uid,
                "token": token,
                "new_password": "new-harbour-lantern-9",
                "confirm_password": "new-harbour-lantern-9",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)


class PasswordResetEndToEndApiTests(APITestCase):
    """The request and confirm endpoints wired together, uid/token straight from the email."""

    def setUp(self):
        cache.clear()  # reset the rate limit between tests

    def test_full_flow_reaches_a_working_password(self):
        user = User.objects.create_user("ada", password=PASSWORD, email="ada@example.com")
        Profile.objects.create(user=user, user_type="student")

        self.client.post(PASSWORD_RESET_URL, {"username": "ada"}, format="json")
        self.assertEqual(len(mail.outbox), 1)

        body = mail.outbox[0].body
        query = body.split("/reset-password?", 1)[1].split("\n", 1)[0]
        params = dict(pair.split("=", 1) for pair in query.split("&"))

        self.client.logout()
        response = self.client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "uid": params["uid"],
                "token": params["token"],
                "new_password": "picked-a-new-one-3",
                "confirm_password": "picked-a-new-one-3",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.client.logout()
        login_response = self.client.post(
            LOGIN_URL, {"username": "ada", "password": "picked-a-new-one-3"}, format="json"
        )
        self.assertEqual(login_response.status_code, 200)
