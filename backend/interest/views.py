from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle

from accounts.permissions import IsAmazonStaff

from .models import ExpressionOfInterest
from .serializers import ExpressionOfInterestSerializer, ExpressionOfInterestStaffSerializer


class ExpressionOfInterestCreateView(generics.CreateAPIView):
    """POST /api/interest/

    Body: full_name, email, user_type, pathway (slug), message (optional).
    Rate limited per IP.
    """

    serializer_class = ExpressionOfInterestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "interest"

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class ExpressionOfInterestListView(generics.ListAPIView):
    """GET /api/interest/submissions/

    All Expressions of Interest, newest first, for Amazon staff only
    (see accounts/permissions.py). Kept separate from the POST endpoint so
    the public one never lists anything. 20 per page.
    """

    serializer_class = ExpressionOfInterestStaffSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaff]
    queryset = ExpressionOfInterest.objects.select_related("pathway")
