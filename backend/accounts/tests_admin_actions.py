"""
The Admin Portal's actions: handling feedback, changing a role, sending a
reset email, and the sidebar counts.

Two properties get the hardest testing here, because both are the kind that
keep working by accident until one day they do not:

STAFF ARE NOT ASSIGNABLE. If the role endpoint could hand out staff access,
the portal's own gate would be pointless, because the way in would be through
the portal.

THE RESET ENDPOINT KEEPS ITS MOUTH SHUT. It must answer identically whether
the account has an email address or not, or a staff account becomes a way of
finding out which addresses exist.
"""
from django.contrib.auth.models import User
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from community.models import Question, Report

from .models import AdminAuditLog, Feedback, Profile

PASSWORD = "harbour-lantern-47"
PIN = "4821"

BADGES_URL = "/api/accounts/admin-portal/badges/"
FEEDBACK_URL = "/api/accounts/admin-portal/feedback/"


def make_user(username, user_type="student", **extra):
    user = User.objects.create_user(username, password=PASSWORD, **extra)
    Profile.objects.create(user=user, user_type=user_type)
    return user


@override_settings(ADMIN_PORTAL_PIN=PIN)
class AdminActionTestCase(APITestCase):
    """Signed in as staff with the PIN entered, which every action needs."""

    def setUp(self):
        cache.clear()
        self.staff = make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post("/api/accounts/admin-portal/unlock/", {"pin": PIN}, format="json")

    def as_student(self):
        """A signed-in student: past the login, nowhere near the portal."""
        self.client.logout()
        if not User.objects.filter(username="astudent").exists():
            make_user("astudent")
        self.client.login(username="astudent", password=PASSWORD)

    def as_locked_staff(self):
        """Staff who have not entered the PIN this session."""
        self.client.logout()
        if not User.objects.filter(username="lockedstaff").exists():
            make_user("lockedstaff", "amazon_staff")
        self.client.login(username="lockedstaff", password=PASSWORD)

    def as_unlocked_staff(self):
        """Back to the one setUp made, PIN and all."""
        self.client.logout()
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post("/api/accounts/admin-portal/unlock/", {"pin": PIN}, format="json")


class FeedbackHandlingTests(AdminActionTestCase):
    def setUp(self):
        super().setUp()
        self.feedback = Feedback.objects.create(category="bug", message="It broke")

    def url(self, pk=None):
        return f"/api/accounts/admin-portal/feedback/{pk or self.feedback.pk}/handle/"

    def test_the_four_ways_in(self):
        """Anonymous, a student, locked staff, then staff with the PIN."""
        self.client.logout()
        self.assertIn(self.client.post(self.url()).status_code, (401, 403))

        self.as_student()
        self.assertEqual(self.client.post(self.url()).status_code, 403)

        self.as_locked_staff()
        self.assertEqual(self.client.post(self.url()).status_code, 403)

        self.as_unlocked_staff()
        self.assertEqual(
            self.client.post(self.url(), {"handled": True}, format="json").status_code, 200
        )

    def test_marking_it_handled_records_who_and_when(self):
        response = self.client.post(self.url(), {"handled": True}, format="json")

        self.assertEqual(response.status_code, 200)
        self.feedback.refresh_from_db()
        self.assertTrue(self.feedback.handled)
        self.assertEqual(self.feedback.handled_by, self.staff)
        self.assertIsNotNone(self.feedback.handled_at)

    def test_putting_it_back_clears_who_and_when(self):
        """A row must never claim somebody dealt with something still open."""
        self.client.post(self.url(), {"handled": True}, format="json")

        self.client.post(self.url(), {"handled": False}, format="json")

        self.feedback.refresh_from_db()
        self.assertFalse(self.feedback.handled)
        self.assertIsNone(self.feedback.handled_by)
        self.assertIsNone(self.feedback.handled_at)

    def test_it_keeps_a_staff_only_note(self):
        self.client.post(
            self.url(), {"handled": True, "admin_note": "replied by email"}, format="json"
        )

        self.feedback.refresh_from_db()
        self.assertEqual(self.feedback.admin_note, "replied by email")

    def test_the_note_never_reaches_the_public_feedback_endpoint(self):
        self.client.post(
            self.url(), {"handled": True, "admin_note": "internal only"}, format="json"
        )

        self.client.logout()
        response = self.client.get("/api/accounts/feedback/")

        self.assertNotIn("internal only", str(getattr(response, "data", "")))

    def test_it_refuses_anything_that_is_not_true_or_false(self):
        for bad in ["yes", 1, None]:
            with self.subTest(bad=bad):
                response = self.client.post(self.url(), {"handled": bad}, format="json")
                self.assertEqual(response.status_code, 400)

    def test_it_is_written_to_the_audit_log(self):
        self.client.post(self.url(), {"handled": True}, format="json")

        entry = AdminAuditLog.objects.get(action=AdminAuditLog.Action.FEEDBACK_HANDLED)
        self.assertEqual(entry.actor_username, "staffer")
        self.assertEqual(entry.detail["handled"], True)

    def test_the_list_filters_by_handled(self):
        Feedback.objects.create(category="bug", message="Still open")
        self.client.post(self.url(), {"handled": True}, format="json")

        done = self.client.get(FEEDBACK_URL, {"handled": "true"}).data["results"]
        todo = self.client.get(FEEDBACK_URL, {"handled": "false"}).data["results"]

        self.assertEqual([row["message"] for row in done], ["It broke"])
        self.assertEqual([row["message"] for row in todo], ["Still open"])

    def test_a_stray_handled_value_shows_everything_rather_than_nothing(self):
        """These come off a URL people share and edit."""
        rows = self.client.get(FEEDBACK_URL, {"handled": "maybe"}).data["results"]

        self.assertEqual(len(rows), 1)

    def test_the_list_says_who_handled_it(self):
        self.client.post(self.url(), {"handled": True}, format="json")

        row = self.client.get(FEEDBACK_URL).data["results"][0]

        self.assertEqual(row["handled_by"], "staffer")
        self.assertTrue(row["handled"])


class BadgeCountTests(AdminActionTestCase):
    def test_it_counts_what_is_still_waiting(self):
        Feedback.objects.create(category="bug", message="one")
        Feedback.objects.create(category="bug", message="two", handled=True)
        asker = make_user("asker")
        question = Question.objects.create(author=asker, title="q", body="b")
        Report.objects.create(reporter=asker, question=question, reason="spam")

        response = self.client.get(BADGES_URL)

        self.assertEqual(response.data["unhandled_feedback"], 1)
        self.assertEqual(response.data["open_reports"], 1)

    def test_it_stays_cheap_however_much_there_is(self):
        """
        It is polled after every action, so it must not walk the tables. The
        pinned number matters less than it not moving between 5 rows and 60.
        """
        for index in range(5):
            Feedback.objects.create(category="bug", message=f"one {index}")

        with self.assertNumQueries(8):
            self.client.get(BADGES_URL)

        for index in range(55):
            Feedback.objects.create(category="bug", message=f"more {index}")

        with self.assertNumQueries(8):
            self.client.get(BADGES_URL)

    def test_a_student_cannot_read_it(self):
        self.as_student()

        self.assertEqual(self.client.get(BADGES_URL).status_code, 403)


class ChangeRoleTests(AdminActionTestCase):
    def setUp(self):
        super().setUp()
        self.person = make_user("ada", "student")

    def url(self, person=None):
        return f"/api/accounts/admin-portal/people/{(person or self.person).pk}/role/"

    def test_it_moves_somebody_between_the_three_ordinary_roles(self):
        response = self.client.post(self.url(), {"user_type": "teacher"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.person.profile.refresh_from_db()
        self.assertEqual(self.person.profile.user_type, "teacher")

    def test_it_will_not_hand_out_staff_access(self):
        """
        The one that matters. An endpoint inside the portal that could make
        somebody staff would make the portal's own gate pointless.
        """
        response = self.client.post(self.url(), {"user_type": "amazon_staff"}, format="json")

        self.assertEqual(response.status_code, 400)
        self.person.profile.refresh_from_db()
        self.assertEqual(self.person.profile.user_type, "student")

    def test_it_will_not_take_staff_access_away_either(self):
        """That is RevokeStaffView: a deliberate separate step."""
        other = make_user("otherstaff", "amazon_staff")

        response = self.client.post(self.url(other), {"user_type": "student"}, format="json")

        self.assertEqual(response.status_code, 400)
        other.profile.refresh_from_db()
        self.assertEqual(other.profile.user_type, "amazon_staff")

    def test_it_leaves_a_superuser_alone(self):
        root = User.objects.create_superuser("root", password=PASSWORD)
        Profile.objects.create(user=root, user_type="student")

        response = self.client.post(self.url(root), {"user_type": "teacher"}, format="json")

        self.assertEqual(response.status_code, 400)

    def test_it_refuses_a_role_that_does_not_exist(self):
        response = self.client.post(self.url(), {"user_type": "wizard"}, format="json")

        self.assertEqual(response.status_code, 400)

    def test_it_records_what_changed_to_what(self):
        self.client.post(self.url(), {"user_type": "parent"}, format="json")

        entry = AdminAuditLog.objects.get(action=AdminAuditLog.Action.ROLE_CHANGED)
        self.assertEqual(entry.target_label, "ada")
        self.assertEqual(entry.detail, {"from": "student", "to": "parent"})

    def test_the_four_ways_in(self):
        self.client.logout()
        self.assertIn(self.client.post(self.url()).status_code, (401, 403))

        self.as_student()
        self.assertEqual(self.client.post(self.url()).status_code, 403)

        self.as_locked_staff()
        self.assertEqual(self.client.post(self.url()).status_code, 403)


class SendPasswordResetTests(AdminActionTestCase):
    def url(self, person):
        return f"/api/accounts/admin-portal/people/{person.pk}/password-reset/"

    def test_it_sends_the_ordinary_reset_email(self):
        person = make_user("ada", email="ada@example.com")

        response = self.client.post(self.url(person))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("ada@example.com", mail.outbox[0].to)

    def test_it_answers_the_same_when_there_is_no_email(self):
        """
        Otherwise a staff account becomes a way of finding out which addresses
        exist, which is exactly what the public form refuses to tell anybody.
        """
        with_email = make_user("has", email="has@example.com")
        without = make_user("hasnot")

        first = self.client.post(self.url(with_email))
        second = self.client.post(self.url(without))

        self.assertEqual(first.status_code, second.status_code)
        self.assertEqual(
            {k: v for k, v in first.data.items() if k != "id"},
            {k: v for k, v in second.data.items() if k != "id"},
        )
        self.assertEqual(len(mail.outbox), 1)  # only the one that had an address

    def test_the_audit_log_records_which_it_actually_was(self):
        """The caller is not told, but this IS worth knowing afterwards."""
        without = make_user("hasnot")

        self.client.post(self.url(without))

        entry = AdminAuditLog.objects.get(action=AdminAuditLog.Action.PASSWORD_RESET_SENT)
        self.assertFalse(entry.detail["had_email"])

    def test_the_four_ways_in(self):
        person = make_user("ada")

        self.client.logout()
        self.assertIn(self.client.post(self.url(person)).status_code, (401, 403))

        self.as_student()
        self.assertEqual(self.client.post(self.url(person)).status_code, 403)

        self.as_locked_staff()
        self.assertEqual(self.client.post(self.url(person)).status_code, 403)
