"""Expressions of Interest submitted through the website form."""
from django.conf import settings
from django.db import models

from content.models import Pathway


class ExpressionOfInterest(models.Model):
    """
    One person saying they would like an Amazon placement.

    This used to be a form that asked for a name, email, role and pathway. It
    is now a tick box on an account, because the site already holds all four,
    and asking again was the complaint. So the User link is the identity here,
    and the other fields are a copy of what the account said at the time, kept
    for the staff list and for the record if the account is later deleted.

    That is why they are all optional: sign-up does not collect a real name or
    an email address, and a pathway is optional there too, so an account can
    honestly have none of them. The tick still means something without them.

    Keep personal data to these fields only (safeguarding for under-18s).
    """

    class UserType(models.TextChoices):
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent or guardian"
        TEACHER = "teacher", "Teacher or school"

    # All copied from the account at the moment of ticking, and all optional
    # because an account can genuinely have none of them (see the class docstring).
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    user_type = models.CharField(max_length=10, choices=UserType.choices, blank=True)
    # PROTECT keeps submissions safe: a pathway with submissions cannot be deleted.
    pathway = models.ForeignKey(
        Pathway,
        on_delete=models.PROTECT,
        related_name="expressions_of_interest",
        null=True,
        blank=True,
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
        who = self.full_name or (self.user.username if self.user else "someone")
        return f"{who} ({self.pathway or 'no pathway'})"

    @classmethod
    def record_for(cls, user):
        """
        Note that this user wants a placement. Returns (interest, created).

        Ticking twice does not make two rows. The tick box is an opt-in, not a
        message, so the honest answer to "register my interest" when they are
        already on the list is "you already are", not another identical row for
        the team to read.

        Everything stored is copied off the account. A blank one is not a
        failure: sign-up asks for none of these, so plenty of real accounts
        have no name and no email, and the User link is what identifies them.
        """
        existing = cls.objects.filter(user=user).first()
        if existing:
            return existing, False

        profile = getattr(user, "profile", None)

        # Profile.pathway_interest holds the pathway's NAME ("Digital"), which
        # is what Pathway.name holds too. Missing or since-renamed just means
        # no pathway on the record.
        pathway = None
        if profile and profile.pathway_interest:
            pathway = Pathway.objects.filter(name=profile.pathway_interest).first()

        # Profile has a user type ours does not (amazon_staff), so anything we
        # cannot represent is left blank rather than written in wrong.
        user_type = getattr(profile, "user_type", "") or ""
        if user_type not in cls.UserType.values:
            user_type = ""

        interest = cls.objects.create(
            user=user,
            full_name=user.get_full_name(),
            email=user.email,
            user_type=user_type,
            pathway=pathway,
        )
        return interest, True
