from io import StringIO
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management import call_command
from rest_framework.test import APITestCase

from content.models import Pathway

from .knowledge import VERIFIED_FACTS, build_system_prompt, content_gaps
from .models import ChatMessage
from .provider import AssistantUnavailable

# Every test patches this. The real one calls Anthropic, which costs money and
# needs the network, so no test ever reaches it.
PROVIDER = "chatbot.views.get_ai_response"


class ChatApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        Pathway.objects.create(
            name="Digital",
            slug="digital",
            summary="Build, run and support technology.",
            description="Covers the Digital T-Levels.",
        )

    def post_message(self, text="What pathways are there?", **extra):
        return self.client.post("/api/chat/", {"message": text, **extra}, format="json")

    def test_guest_can_chat_without_an_account(self):
        with patch(PROVIDER, return_value="There are five pathways.") as provider:
            response = self.post_message()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "There are five pathways.")
        provider.assert_called_once()

    def test_both_sides_of_the_conversation_are_stored(self):
        with patch(PROVIDER, return_value="There are five pathways."):
            self.post_message("What pathways are there?")

        messages = list(ChatMessage.objects.all())
        self.assertEqual([m.role for m in messages], ["user", "assistant"])
        self.assertEqual(messages[0].message, "What pathways are there?")
        # A guest has a session but no account.
        self.assertIsNone(messages[0].user)
        self.assertTrue(messages[0].session_id)
        self.assertEqual(messages[0].session_id, messages[1].session_id)

    def test_signed_in_messages_are_attached_to_the_account(self):
        user = User.objects.create_user("amir", password="t-smile-test-pw")
        self.client.force_login(user)

        with patch(PROVIDER, return_value="Yes."):
            self.post_message()

        self.assertEqual(ChatMessage.objects.filter(user=user).count(), 2)

    def test_earlier_turns_are_sent_as_history(self):
        with patch(PROVIDER, return_value="There are five.") as provider:
            self.post_message("What pathways are there?")
            self.post_message("What about Media?")

        history = provider.call_args.kwargs["history"]
        self.assertEqual(
            history,
            [
                {"role": "user", "content": "What pathways are there?"},
                {"role": "assistant", "content": "There are five."},
            ],
        )

    def test_the_grounding_is_built_from_the_database(self):
        with patch(PROVIDER, return_value="Yes.") as provider:
            self.post_message()

        context = provider.call_args.kwargs["context"]
        self.assertIn("Build, run and support technology.", context)

    def test_a_wrong_quiz_answer_grounds_the_reply_in_that_question(self):
        with patch(PROVIDER, return_value="Happy to explain.") as provider:
            response = self.client.post(
                "/api/chat/",
                {
                    "message": "I do not get this one.",
                    "quiz_question": "How long is the industry placement?",
                    "quiz_correct_answer": "At least 315 hours",
                    "quiz_explanation": "That is roughly 45 days.",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        context = provider.call_args.kwargs["context"]
        self.assertIn("How long is the industry placement?", context)
        self.assertIn("At least 315 hours", context)
        self.assertIn("roughly 45 days", context)

    def test_markup_is_stripped_before_anything_is_stored(self):
        with patch(PROVIDER, return_value="Sure."):
            self.post_message("<script>alert('x')</script>Tell me about Digital")

        stored = ChatMessage.objects.filter(role="user").first().message
        self.assertNotIn("<script>", stored)
        self.assertIn("Tell me about Digital", stored)

    def test_an_empty_message_is_rejected(self):
        response = self.post_message("   ")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(ChatMessage.objects.exists())

    def test_a_broken_assistant_does_not_break_the_site(self):
        with patch(PROVIDER, side_effect=AssistantUnavailable("it is down")):
            response = self.post_message()

        self.assertEqual(response.status_code, 503)
        # The question was still asked, so it is kept. No half-written reply is.
        self.assertEqual(ChatMessage.objects.filter(role="user").count(), 1)
        self.assertFalse(ChatMessage.objects.filter(role="assistant").exists())

        # The rest of the API is unaffected.
        self.assertEqual(self.client.get("/api/pathways/").status_code, 200)

    def test_history_is_returned_for_this_visitor_only(self):
        with patch(PROVIDER, return_value="There are five."):
            self.post_message("What pathways are there?")

        response = self.client.get("/api/chat/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [m["message"] for m in response.data["messages"]],
            ["What pathways are there?", "There are five."],
        )

        # Somebody else, with their own session, sees none of it.
        self.client.logout()
        other = self.client_class()
        self.assertEqual(other.get("/api/chat/").data["messages"], [])


    def test_the_audience_pitches_the_answer_but_is_never_stored(self):
        with patch(PROVIDER, return_value="Happy to help.") as provider:
            response = self.post_message("How does the placement work?", audience="parent")

        self.assertEqual(response.status_code, 200)
        self.assertIn("parent or carer", provider.call_args.kwargs["context"])
        stored = " ".join(ChatMessage.objects.values_list("message", flat=True))
        self.assertNotIn("parent", stored)

    def test_an_unknown_audience_is_rejected(self):
        response = self.post_message("Hello", audience="headteacher")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(ChatMessage.objects.exists())

    def test_the_wrong_answer_they_chose_is_explained(self):
        with patch(PROVIDER, return_value="Close!") as provider:
            self.post_message(
                "Why was I wrong?",
                quiz_question="How long is the placement?",
                quiz_correct_answer="At least 315 hours, roughly 45 days",
                quiz_chosen_answer="Two weeks",
            )

        self.assertIn("The answer they chose: Two weeks", provider.call_args.kwargs["context"])


class KnowledgeTests(APITestCase):
    def test_quoted_facts_match_the_site(self):
        """
        Every quoted fact must still appear word for word in the page it came
        from. If this fails, the site's copy changed: paste the new wording into
        VERIFIED_FACTS so Smiley says the same as the page.
        """
        repo_root = Path(settings.BASE_DIR).parent
        sources = {}
        quoted_facts = [fact for fact in VERIFIED_FACTS if fact.quoted_from]
        self.assertTrue(quoted_facts, "Expected facts quoted from the site's copy.")

        for fact in quoted_facts:
            if fact.quoted_from not in sources:
                sources[fact.quoted_from] = (repo_root / fact.quoted_from).read_text(
                    encoding="utf-8"
                )
            for part in fact.quoted_parts:
                with self.subTest(topic=fact.topic):
                    self.assertIn(part, sources[fact.quoted_from])

    def test_smiley_has_a_personality_but_keeps_the_rules(self):
        prompt = build_system_prompt()
        self.assertIn("You are Smiley", prompt)
        self.assertIn("End most answers with one short question", prompt)
        # The personality never loosens the safety rules.
        self.assertIn("Use only the facts above", prompt)
        self.assertIn("Never ask for personal details", prompt)
        self.assertIn("Sarcasm, teasing", prompt)

    def test_unwritten_facts_are_declared_as_not_known(self):
        prompt = build_system_prompt()
        self.assertIn("NOT KNOWN", prompt)
        for fact in content_gaps():
            self.assertIn(fact.topic, prompt)

    def test_written_facts_are_included(self):
        prompt = build_system_prompt()
        written = [fact for fact in VERIFIED_FACTS if not fact.is_gap]
        self.assertTrue(written, "Expected at least one written fact.")
        for fact in written:
            self.assertIn(fact.text, prompt)

    def test_check_chat_facts_reports_the_gaps(self):
        # Exits non-zero while anything is unwritten, so it can gate a build.
        output = StringIO()
        with self.assertRaises(SystemExit):
            call_command("check_chat_facts", stdout=output)

        printed = output.getvalue()
        for fact in content_gaps():
            self.assertIn(fact.topic, printed)
