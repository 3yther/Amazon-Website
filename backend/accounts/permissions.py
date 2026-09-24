"""Permission classes shared across the API."""
from rest_framework.permissions import BasePermission

from .models import Profile


class IsAmazonStaff(BasePermission):
    """
    Only a signed-in Amazon staff account passes.

    Staff is a Profile.user_type, and it can only ever be set by hand in
    Django admin: RegisterSerializer's REGISTRATION_USER_TYPES deliberately
    leaves AMAZON_STAFF out, so nobody can sign themselves up as staff.

    Fails closed. A user with no Profile row is denied rather than raising:
    Django's reverse one-to-one accessor raises RelatedObjectDoesNotExist,
    which subclasses AttributeError, so getattr() returns None here instead
    of turning a missing profile into a 500.
    """

    message = "Only Amazon staff can see this."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated):
            return False

        profile = getattr(user, "profile", None)
        return getattr(profile, "user_type", None) == Profile.UserType.AMAZON_STAFF
