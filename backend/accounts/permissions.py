"""Permission classes shared across the API."""
from rest_framework.permissions import BasePermission

from .models import Profile
from .portal_lock import is_unlocked


class IsAmazonStaff(BasePermission):
    """Only lets signed-in Amazon staff through.

    Staff can only be set in Django admin (sign up doesn't offer it).
    A user with no Profile is refused instead of causing an error.
    """

    message = "Only Amazon staff can see this."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated):
            return False

        profile = getattr(user, "profile", None)
        return getattr(profile, "user_type", None) == Profile.UserType.AMAZON_STAFF


class IsAmazonStaffAndUnlocked(IsAmazonStaff):
    """
    Amazon staff who have also entered the Admin Portal's PIN this session.

    Every Admin Portal endpoint uses this. Note what it does NOT do: it never
    replaces the staff check, it adds to it. A correct PIN on a student's
    account still gets nothing, because IsAmazonStaff runs first.
    """

    message = "Enter the Admin Portal PIN to see this."

    def has_permission(self, request, view):
        return super().has_permission(request, view) and is_unlocked(request)
