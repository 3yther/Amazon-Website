"""Permission classes shared across the API."""
from rest_framework.permissions import BasePermission

from .models import Profile


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
