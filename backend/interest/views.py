from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from accounts.permissions import IsAmazonStaff

from .models import ExpressionOfInterest
from .serializers import ExpressionOfInterestStaffSerializer, InterestOptInSerializer


class ExpressionOfInterestCreateView(generics.CreateAPIView):
    """POST /api/interest/

    Takes no body. Ticking the box on /register-interest says "I would like an
    Amazon placement", and everything recorded is copied off the account.

    SIGNING IN IS REQUIRED, which is a change. It used to accept anybody, with
    a form that asked for a name, email, role and pathway. The complaint was
    that the site already knew all four, so the form went; and once it has
    gone, there is nothing left to identify an anonymous submission by. Asking
    people to sign in is the honest version of "we already know this about
    you". The page says so, and offers a way to sign in, rather than failing.

    Ticking twice answers 200 with the row they already have, instead of
    filing a duplicate.
    """

    serializer_class = InterestOptInSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "interest"

    def create(self, request, *args, **kwargs):
        interest, created = ExpressionOfInterest.record_for(request.user)
        return Response(
            self.get_serializer(interest).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ExpressionOfInterestListView(generics.ListAPIView):
    """GET /api/interest/submissions/

    All Expressions of Interest, newest first, for Amazon staff only
    (see accounts/permissions.py). Kept separate from the POST endpoint so
    the public one never lists anything. 20 per page.
    """

    serializer_class = ExpressionOfInterestStaffSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaff]
    queryset = ExpressionOfInterest.objects.select_related("pathway", "user")
