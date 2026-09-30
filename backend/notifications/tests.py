from django.contrib.admin.sites import site
from django.contrib.auth.models import User
from django.test import RequestFactory
from rest_framework.test import APITestCase

from accounts.models import Profile, UserPreference
from community.models import Answer, Question
from interest.models import ExpressionOfInterest

from .admin import send_announcement
from .models import Announcement, Notification


def make_user(name):
    user = User.objects.create_user(name, password="harbour-lantern-47")
    Profile.objects.create(user=user, user_type="student")
    return user


class CommunityNotificationTests(APITestCase):
    def setUp(self):
        self.asker = make_user("asker")
        self.helper = make_user("helper")
        self.question = Question.objects.create(author=self.asker, title="How long is the placement?", body="")

    def answer(self, user):
        self.client.force_authenticate(user)
        return self.client.post(
            f"/api/community/questions/{self.question.pk}/answers/",
            {"body": "At least 315 hours, about 45 days."},
            format="json",
        )

    def test_an_answer_notifies_the_asker(self):
        self.assertEqual(self.answer(self.helper).status_code, 201)
        note = Notification.objects.get(user=self.asker)
        self.assertEqual(note.event, "answered")
        self.assertEqual(note.text, "How long is the placement?")
        self.assertEqual(note.link, f"/community/{self.question.pk}")

    def test_answering_your_own_question_does_not(self):
        self.answer(self.asker)
        self.assertFalse(Notification.objects.exists())

    def test_turning_community_off_stops_them(self):
        UserPreference.objects.create(user=self.asker, notify_community=False)
        self.answer(self.helper)
        self.assertFalse(Notification.objects.filter(user=self.asker).exists())

    def test_accepting_an_answer_notifies_its_author(self):
        answer = Answer.objects.create(author=self.helper, question=self.question, body="About 45 days.")
        self.client.force_authenticate(self.asker)
        self.client.post(f"/api/community/answers/{answer.pk}/accept/")
        self.assertEqual(Notification.objects.get(user=self.helper).event, "accepted")


class AnnouncementTests(APITestCase):
    def test_goes_to_everyone_who_has_announcements_on(self):
        keen = make_user("keen")
        quiet = make_user("quiet")
        UserPreference.objects.create(user=quiet, notify_announcements=False)

        send_announcement(Announcement.objects.create(title="New resources for Digital", link="/resources"))

        self.assertTrue(Notification.objects.filter(user=keen, event="announcement").exists())
        self.assertFalse(Notification.objects.filter(user=quiet).exists())


class InterestSeenTests(APITestCase):
    def test_marking_seen_notifies_the_person_once(self):
        person = make_user("keen")
        interest = ExpressionOfInterest.objects.create(user=person)
        admin_class = site._registry[ExpressionOfInterest]
        request = RequestFactory().post("/")

        admin_class.mark_seen(request, ExpressionOfInterest.objects.all())
        admin_class.mark_seen(request, ExpressionOfInterest.objects.all())

        interest.refresh_from_db()
        self.assertIsNotNone(interest.seen_at)
        self.assertEqual(Notification.objects.filter(user=person, event="interest_seen").count(), 1)


class NotificationApiTests(APITestCase):
    def setUp(self):
        self.user = make_user("ada")
        self.other = make_user("bob")
        for text in ["one", "two"]:
            Notification.objects.create(user=self.user, kind="community", event="answered", text=text)
        Notification.objects.create(user=self.other, kind="community", event="answered", text="not yours")

    def test_needs_signing_in(self):
        self.assertEqual(self.client.get("/api/notifications/").status_code, 401)

    def test_lists_only_your_own_with_the_unread_count(self):
        self.client.force_authenticate(self.user)
        data = self.client.get("/api/notifications/").data
        self.assertEqual(data["unread"], 2)
        self.assertEqual({n["text"] for n in data["results"]}, {"one", "two"})

    def test_mark_all_read(self):
        self.client.force_authenticate(self.user)
        self.client.post("/api/notifications/read/")
        self.assertEqual(self.client.get("/api/notifications/").data["unread"], 0)
        self.assertFalse(Notification.objects.get(user=self.other).read)

    def test_cannot_mark_someone_elses(self):
        self.client.force_authenticate(self.user)
        theirs = Notification.objects.get(user=self.other)
        self.assertEqual(self.client.post(f"/api/notifications/{theirs.pk}/read/").status_code, 404)

    def test_settings_can_switch_kinds_off(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch("/api/accounts/user-preferences/", {"notify_interest": False}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["notify_interest"])
