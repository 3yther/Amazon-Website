"""
User profiles. Login, passwords (salted and hashed) and sessions all come from
Django's built-in auth User. Profile only adds the T-SMILE specific fields.
"""
from django.conf import settings
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} ({self.get_user_type_display()})"
