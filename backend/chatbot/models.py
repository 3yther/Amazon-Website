"""Chat history for the AI chatbot (Task 4). Model only for now, no endpoints yet."""
from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
    """
    One message in a conversation. session_id groups a conversation for every
    visitor; user is also set when they are signed in.
    """

    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    session_id = models.CharField(max_length=64, db_index=True)
    # Deleting a user deletes their chat history too (keep personal data minimal).
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chat_messages",
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.session_id} {self.role}: {self.message[:40]}"
