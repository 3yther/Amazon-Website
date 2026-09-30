"""Notifications for the bell in the header, and announcements from staff."""
from django.conf import settings
from django.db import models


class Notification(models.Model):
    """One message for one person. The words are made on the front end from
    `event`, so they come out in the reader's language."""

    class Kind(models.TextChoices):
        ANNOUNCEMENT = "announcement", "Announcement"
        COMMUNITY = "community", "Community"
        INTEREST = "interest", "Interest"

    class Event(models.TextChoices):
        ANNOUNCEMENT = "announcement", "Announcement"
        ANSWERED = "answered", "Your question was answered"
        ACCEPTED = "accepted", "Your answer was marked as the one that helped"
        INTEREST_SEEN = "interest_seen", "Your interest was seen by the team"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    kind = models.CharField(max_length=20, choices=Kind.choices)
    event = models.CharField(max_length=20, choices=Event.choices)
    # Something to show with it, like the question's title or the announcement.
    text = models.CharField(max_length=300, blank=True, default="")
    # Where clicking it goes, e.g. /community/12.
    link = models.CharField(max_length=200, blank=True, default="")
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} {self.event}"


class Announcement(models.Model):
    """Written by staff in Django admin. Saving a new one notifies everyone who
    has announcements switched on (see admin.py)."""

    title = models.CharField(max_length=150)
    message = models.TextField(blank=True)
    link = models.CharField(
        max_length=200, blank=True, default="", help_text="Optional page on the site, e.g. /resources"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
