"""Expressions of Interest submitted through the website form."""
from django.conf import settings
from django.db import models

from content.models import Pathway


class ExpressionOfInterest(models.Model):
    """
    One submission. Anyone can submit; if they were signed in, the User is linked.
    Keep personal data to these fields only (safeguarding for under-18s).
    """

    class UserType(models.TextChoices):
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent or guardian"
        TEACHER = "teacher", "Teacher or school"

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    user_type = models.CharField(max_length=10, choices=UserType.choices)
    # PROTECT keeps submissions safe: a pathway with submissions cannot be deleted.
    pathway = models.ForeignKey(
        Pathway, on_delete=models.PROTECT, related_name="expressions_of_interest"
    )
    message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expressions_of_interest",
    )

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name = "expression of interest"
        verbose_name_plural = "expressions of interest"

    def __str__(self):
        return f"{self.full_name} ({self.pathway})"
