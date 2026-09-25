import re

from django.utils.html import strip_tags
from rest_framework import serializers

from .knowledge import AUDIENCES, LANGUAGES
from .models import ChatMessage

# Long enough for a real question, short enough to keep the prompt small and to
# stop anyone pasting an essay into our API.
MAX_MESSAGE_LENGTH = 1000

# Anything that is not a tab or newline in the C0/C1 control ranges.
CONTROL_CHARACTERS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")


def sanitise(text):
    """Cleans text from the browser (strips HTML tags) before saving it."""
    text = strip_tags(text)
    text = CONTROL_CHARACTERS.sub("", text)
    return text.strip()


class ChatRequestSerializer(serializers.Serializer):
    """One message from a visitor. The quiz fields and audience help the answer,
    but only the message itself is saved.
    """

    message = serializers.CharField(max_length=MAX_MESSAGE_LENGTH, trim_whitespace=True)
    audience = serializers.ChoiceField(
        choices=sorted(AUDIENCES), required=False, allow_blank=True
    )
    # The site language the visitor chose, so Smiley replies in it.
    language = serializers.ChoiceField(choices=sorted(LANGUAGES), required=False, allow_blank=True)
    quiz_question = serializers.CharField(max_length=300, required=False, allow_blank=True)
    quiz_correct_answer = serializers.CharField(
        max_length=200, required=False, allow_blank=True
    )
    quiz_chosen_answer = serializers.CharField(max_length=200, required=False, allow_blank=True)
    quiz_explanation = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_message(self, value):
        cleaned = sanitise(value)
        if not cleaned:
            raise serializers.ValidationError("Type a question first.")
        return cleaned

    def validate_quiz_question(self, value):
        return sanitise(value)

    def validate_quiz_correct_answer(self, value):
        return sanitise(value)

    def validate_quiz_chosen_answer(self, value):
        return sanitise(value)

    def validate_quiz_explanation(self, value):
        return sanitise(value)


class ChatMessageSerializer(serializers.ModelSerializer):
    """One line of the transcript, for the front end to redraw a conversation."""

    class Meta:
        model = ChatMessage
        fields = ["role", "message", "created_at"]
