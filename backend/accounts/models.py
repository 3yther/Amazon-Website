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

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    user_type = models.CharField(max_length=20, choices=UserType.choices)
    pathway_interest = models.CharField(
        max_length=20, choices=PathwayName.choices, null=True, blank=True
    )
    phone = models.CharField(max_length=32, blank=True, default="")
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
    date_format = models.CharField(max_length=20, default="MM/DD/YYYY")
    number_format = models.CharField(max_length=10, default="US")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user}"
