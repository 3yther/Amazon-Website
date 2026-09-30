"""
User profiles. Login, passwords (salted and hashed) and sessions all come from
Django's built-in auth User. Profile only adds the T-SMILE specific fields.
"""
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from content.models import PathwayName


class Profile(models.Model):
    """Extra details for one User (one-to-one)."""

    class UserType(models.TextChoices):
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent or guardian"
        TEACHER = "teacher", "Teacher or school"
        AMAZON_STAFF = "amazon_staff", "Amazon staff"

    class HeardAbout(models.TextChoices):
        SEARCH_ENGINE = "search_engine", "Search engine"
        SOCIAL_MEDIA = "social_media", "Social media"
        FRIEND_FAMILY = "friend_family", "Friend or family"
        ADVERT = "advert", "Advert"
        INFLUENCER = "influencer", "Influencer"
        AI = "ai", "AI assistant"
        OTHER = "other", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    user_type = models.CharField(max_length=20, choices=UserType.choices)
    pathway_interest = models.CharField(
        max_length=20, choices=PathwayName.choices, null=True, blank=True
    )
    phone = models.CharField(max_length=32, blank=True, default="")
    # The optional "How did you hear about us?" question on the sign up page.
    heard_about = models.CharField(max_length=20, choices=HeardAbout.choices, blank=True, default="")
    is_deactivated = models.BooleanField(default=False)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    # Set once at profile creation (registration), then updated by hand in
    # ChangePasswordView whenever the password actually changes.
    last_password_changed = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} ({self.get_user_type_display()})"


class UserPreference(models.Model):
    """One user's accessibility, display and locale settings (one-to-one)."""

    class ColorBlindnessType(models.TextChoices):
        NONE = "none", "None"
        PROTANOPIA = "protanopia", "Protanopia"
        DEUTERANOPIA = "deuteranopia", "Deuteranopia"
        TRITANOPIA = "tritanopia", "Tritanopia"

    class Theme(models.TextChoices):
        LIGHT = "light", "Light"
        DARK = "dark", "Dark"
        SYSTEM = "system", "Match system"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences"
    )

    font_size_scale = models.IntegerField(
        default=100, validators=[MinValueValidator(80), MaxValueValidator(150)]
    )
    high_contrast = models.BooleanField(default=False)
    text_spacing_level = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(3)]
    )
    color_blindness_type = models.CharField(
        max_length=20, choices=ColorBlindnessType.choices, default=ColorBlindnessType.NONE
    )
    text_to_speech = models.BooleanField(default=False)
    reduce_motion = models.BooleanField(default=False)

    theme = models.CharField(max_length=10, choices=Theme.choices, default=Theme.SYSTEM)
    button_outline_style = models.CharField(max_length=20, default="default")
    page_background = models.CharField(max_length=20, default="white")

    language = models.CharField(max_length=10, default="en")

    # Which notifications go in the bell (see notifications/notify.py). All on by default.
    notify_announcements = models.BooleanField(default=True)
    notify_community = models.BooleanField(default=True)
    notify_interest = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user}"


class Feedback(models.Model):
    """
    Feedback submitted through the site's feedback form (see the /feedback
    page). Anyone can submit; if they were signed in, the User is linked.
    """

    class Category(models.TextChoices):
        BUG = "bug", "Bug report"
        FEATURE = "feature", "Feature suggestion"
        GENERAL = "general", "General feedback"
        ACCESSIBILITY = "accessibility", "Accessibility issue"

    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    message = models.TextField()
    email = models.EmailField(blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback_submissions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # Whether staff have dealt with this one. Feedback arrives faster than it
    # gets acted on, so without this the list is the same wall of messages
    # every week and the new ones are the hardest to find.
    handled = models.BooleanField(default=False)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback_handled",
    )
    handled_at = models.DateTimeField(null=True, blank=True)
    # Staff-only. Never shown to whoever sent the feedback, and never returned
    # by any public endpoint.
    admin_note = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_category_display()} ({self.created_at:%Y-%m-%d})"


class AdminAuditLog(models.Model):
    """One staff action. Append-only by convention; nothing here updates a row."""

    class Action(models.TextChoices):
        # People
        ACCOUNT_REMOVED = "account_removed", "Removed an account"
        STAFF_REVOKED = "staff_revoked", "Took admin access away"
        ROLE_CHANGED = "role_changed", "Changed an account's role"
        PASSWORD_RESET_SENT = "password_reset_sent", "Sent a password reset email"
        # Community
        POST_DELETED = "post_deleted", "Deleted a post"
        REPORT_RESOLVED = "report_resolved", "Resolved a report"
        REPORT_DISMISSED = "report_dismissed", "Dismissed a report"
        # Feedback
        FEEDBACK_HANDLED = "feedback_handled", "Marked feedback handled"
        # Everything else
        CSV_EXPORTED = "csv_exported", "Exported a CSV"

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_actions",
        help_text="The staff member who did it. Kept as NULL if their own account goes later.",
    )
    # The username is copied in as well, because actor goes NULL when that
    # account is removed and "somebody deleted this" is a worse record than
    # "amirsalah deleted this".
    actor_username = models.CharField(max_length=150, blank=True)

    action = models.CharField(max_length=40, choices=Action.choices)

    # What it was done to. Kept as loose text rather than a foreign key: the
    # row usually no longer exists (that was the point of the action), so a
    # foreign key would either block the delete or blank the only useful part.
    target_type = models.CharField(max_length=40, blank=True)
    target_id = models.CharField(max_length=40, blank=True)
    target_label = models.CharField(max_length=200, blank=True)

    # Anything worth keeping that does not fit above, e.g. the old and new role
    # on a role change, or the filters a CSV was exported with. Never anything
    # secret: this is read by every member of staff.
    detail = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "admin audit log entry"
        verbose_name_plural = "admin audit log"

    def __str__(self):
        return f"{self.actor_username or 'somebody'} {self.action} {self.target_label}".strip()
