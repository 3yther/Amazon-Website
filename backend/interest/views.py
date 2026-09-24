from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle

from accounts.permissions import IsAmazonStaff

from .models import ExpressionOfInterest
from .serializers import ExpressionOfInterestSerializer, ExpressionOfInterestStaffSerializer


class ExpressionOfInterestCreateView(generics.CreateAPIView):
    """
    POST /api/interest/

    Body: full_name, email, user_type (student | parent | teacher),
    pathway (a pathway slug), message (optional).
    Returns 201 with id, pathway and submitted_at, or 400 with field errors.
    Rate limited per IP (see DEFAULT_THROTTLE_RATES in settings).
    """

    serializer_class = ExpressionOfInterestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "interest"

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class ExpressionOfInterestListView(generics.ListAPIView):
    """
    GET /api/interest/submissions/

    Every Expression of Interest, newest first, for Amazon staff only.

    This is a separate endpoint rather than a GET added to the create view
    above, so that the public POST path is untouched: /api/interest/ still
    answers 405 to GET for everyone, still throttles, and still echoes none
    of the personal fields back. Keeping the read path on its own URL means
    a change to one cannot quietly alter the other.

    Staff is a Profile.user_type that only Django admin can set; see
    accounts/permissions.py. Paginated by the project-wide
    PageNumberPagination (PAGE_SIZE in settings.py), since this list only
    ever grows.
    """

    serializer_class = ExpressionOfInterestStaffSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaff]
    queryset = ExpressionOfInterest.objects.select_related("pathway")
