from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from .serializers import ExpressionOfInterestSerializer


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
