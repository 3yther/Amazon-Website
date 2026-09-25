"""Pathways and the resources library. Schema follows MODELS.md exactly."""
from django.db import models


class PathwayName(models.TextChoices):
    """The five pathways. Shared with Profile.pathway_interest in the accounts app."""

    DIGITAL = "Digital", "Digital"
    BUSINESS = "Business", "Business"
    MEDIA = "Media", "Media"
    FINANCE = "Finance", "Finance"
    ENGINEERING = "Engineering", "Engineering"


class Pathway(models.Model):
    """A T-Level pathway, e.g. Digital. Groups content and expressions of interest."""

    name = models.CharField(max_length=20, choices=PathwayName.choices, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    summary = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ContentItem(models.Model):
    """One resource in the library: a guide, document, video or pack."""

    class ContentType(models.TextChoices):
        GUIDE = "guide", "Guide"
        DOCUMENT = "document", "Document"
        VIDEO = "video", "Video"
        PREP_PACK = "prep_pack", "Prep pack"
        CLASS_PACK = "class_pack", "Class pack"

    class AccessLevel(models.TextChoices):
        FREE = "free", "Free"
        SIGNUP = "signup", "Sign-up (needs an account)"

    class Audience(models.TextChoices):
        ALL = "all", "Everyone"
        STUDENT = "student", "Students"
        PARENT = "parent", "Parents and guardians"
        TEACHER = "teacher", "Teachers and schools"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    access_level = models.CharField(
        max_length=10, choices=AccessLevel.choices, default=AccessLevel.FREE
    )
    # Null means the item applies to every pathway. PROTECT stops a pathway being
    # deleted while content still points at it.
    pathway = models.ForeignKey(
        Pathway,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="content_items",
        help_text="Leave empty if this applies to all pathways.",
    )
    audience = models.CharField(max_length=10, choices=Audience.choices, default=Audience.ALL)
    # Local disk in development, S3 in production (see STORAGES in settings).
    # The database only stores the file's path, never the file itself.
    file = models.FileField(upload_to="content/", null=True, blank=True)
    # Official guides are linked rather than copied, so they stay current.
    link = models.URLField(
        max_length=500,
        blank=True,
        help_text="A resource on another website. Leave empty if you upload a file.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
