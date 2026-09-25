"""The Community: questions and answers about T-Levels and Amazon placements.

Most users are 16 to 18, so posts can be hidden (by reports or staff) and
checked in admin. A user's posts are deleted with their account. Smiley
never uses these answers as facts.
"""
from django.conf import settings
from django.db import models
from django.db.models import Q

from content.models import Pathway

# This many reports from different people hide a post until staff look at it.
REPORTS_TO_HIDE = 3


class Topic(models.TextChoices):
    """What a question is about. Shown as a filter on the Community page."""

    TLEVELS = "tlevels", "T Levels in general"
    PLACEMENTS = "placements", "Placements"
    AMAZON = "amazon", "Amazon"
    CHOOSING = "choosing", "Choosing and applying"
    STUDY = "study", "Studying and assessment"
    OTHER = "other", "Something else"


class Post(models.Model):
    """What questions and answers have in common. Never used on its own."""

    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # Hidden posts stay in the database for staff to review in admin, but
    # nobody else sees them. Their author sees them with a note.
    hidden = models.BooleanField(default=False)
    hidden_reason = models.CharField(max_length=20, blank=True, default="")

    class Meta:
        abstract = True

    def hide(self, reason):
        self.hidden = True
        self.hidden_reason = reason
        self.save(update_fields=["hidden", "hidden_reason"])


class Question(Post):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="community_questions"
    )
    title = models.CharField(max_length=150)
    topic = models.CharField(max_length=20, choices=Topic.choices, default=Topic.TLEVELS)
    # Optional: which pathway it is about. Kept if a pathway is ever removed.
    pathway = models.ForeignKey(
        Pathway, on_delete=models.SET_NULL, null=True, blank=True, related_name="community_questions"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Answer(Post):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="community_answers"
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    # Marked by the person who asked: "this is the one that helped me".
    is_accepted = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Answer to {self.question}"


class Helpful(models.Model):
    """One person saying a question or an answer was helpful. Once each."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True, related_name="helpful_marks")
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True, related_name="helpful_marks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "question"], name="one_helpful_per_question"),
            models.UniqueConstraint(fields=["user", "answer"], name="one_helpful_per_answer"),
            models.CheckConstraint(
                condition=Q(question__isnull=False, answer__isnull=True)
                | Q(question__isnull=True, answer__isnull=False),
                name="helpful_marks_one_post",
            ),
        ]


class Report(models.Model):
    """Somebody flagging a post for staff to look at."""

    class Reason(models.TextChoices):
        PERSONAL = "personal", "Shares personal details"
        UNKIND = "unkind", "Unkind or bullying"
        UNSAFE = "unsafe", "Worried about someone's safety"
        WRONG = "wrong", "Wrong or misleading"
        SPAM = "spam", "Spam or advertising"
        OTHER = "other", "Something else"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True, related_name="reports")
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True, related_name="reports")
    reason = models.CharField(max_length=20, choices=Reason.choices)
    note = models.CharField(max_length=300, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    # Ticked by staff in admin once they have dealt with it.
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["resolved", "-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["reporter", "question"], name="one_report_per_question"),
            models.UniqueConstraint(fields=["reporter", "answer"], name="one_report_per_answer"),
            models.CheckConstraint(
                condition=Q(question__isnull=False, answer__isnull=True)
                | Q(question__isnull=True, answer__isnull=False),
                name="reports_one_post",
            ),
        ]

    @property
    def post(self):
        return self.question or self.answer

    def __str__(self):
        return f"{self.get_reason_display()}: {self.post}"
