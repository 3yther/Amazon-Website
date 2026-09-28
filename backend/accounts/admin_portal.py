"""
The Admin Portal's own endpoints: unlocking it, the Overview numbers, and the
People tab.

Everything here except the unlock itself is behind IsAmazonStaffAndUnlocked,
which is IsAmazonStaff plus the PIN. Moderating Community posts lives in
community/views.py instead, next to the models it acts on, behind the same
permission.

Content and providers are deliberately NOT here. They stay in Django admin.
"""
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Count
from django.db.models.functions import TruncWeek
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from community.models import Answer, Question
from content.models import Pathway
from interest.models import ExpressionOfInterest

from .models import Feedback, Profile
from .permissions import IsAmazonStaff, IsAmazonStaffAndUnlocked
from .portal_lock import is_unlocked, lock, pin_is_correct, unlock

# How far back the Overview charts look. Long enough to show a trend, short
# enough that the bars stay readable without scrolling.
OVERVIEW_WEEKS = 8


class UnlockView(APIView):
    """POST /api/accounts/admin-portal/unlock/

    Body: { "pin": "1234" }

    Needs Amazon staff ALREADY SIGNED IN, so this is a second factor rather
    than a way in. Rate limited hard (see the admin_portal_pin scope): a
    4-digit PIN is 10,000 combinations, and this throttle is the thing that
    makes guessing them hopeless.

    A wrong PIN is a flat 400. It does not say how many tries are left, and it
    never locks the account: an account lockout here would let anyone who
    knows a staff username lock a real staff member out of their own portal by
    typing rubbish.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaff]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "admin_portal_pin"

    def post(self, request):
        if not pin_is_correct(request.data.get("pin", "")):
            return Response(
                {"pin": ["That PIN is not right."]}, status=status.HTTP_400_BAD_REQUEST
            )

        unlock(request)
        return Response({"unlocked": True})


class LockView(APIView):
    """POST /api/accounts/admin-portal/lock/  — leave the portal, ask again next time."""

    permission_classes = [IsAuthenticated, IsAmazonStaff]

    def post(self, request):
        lock(request)
        return Response({"unlocked": False})


class StatusView(APIView):
    """GET /api/accounts/admin-portal/status/

    Whether this session has entered the PIN, so the page knows to show the
    keypad or the portal. Staff-only but not unlock-only, because a locked
    session has to be able to ask.

    configured says whether a PIN exists at all: without one the portal cannot
    be unlocked by anybody, and the page should say so rather than sit there
    rejecting every guess.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaff]

    def get(self, request):
        return Response(
            {
                "unlocked": is_unlocked(request),
                "configured": bool(settings.ADMIN_PORTAL_PIN),
                "minutes": settings.ADMIN_PORTAL_UNLOCK_MINUTES,
            }
        )


def _weekly(queryset, field="created_at"):
    """{ "2026-09-21": 4, ... } for the last OVERVIEW_WEEKS weeks."""
    since = timezone.now() - timedelta(weeks=OVERVIEW_WEEKS)
    rows = (
        queryset.filter(**{f"{field}__gte": since})
        .annotate(week=TruncWeek(field))
        .values("week")
        .annotate(count=Count("id"))
        .order_by("week")
    )
    return {row["week"].date().isoformat(): row["count"] for row in rows if row["week"]}


class OverviewView(APIView):
    """GET /api/accounts/admin-portal/overview/

    The numbers behind the Overview tab's charts. Counted in the database with
    Count and TruncWeek rather than pulled into Python and tallied, so this
    stays one query per chart however much data there is.

    The shapes are deliberately dull: a list of {label, value} per chart, so
    the front end can draw a bar, a ring or a table from the same thing, and
    so the accessible text fallback is the same numbers rather than a second
    source of truth.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get(self, request):
        return Response(
            {
                "weeks": OVERVIEW_WEEKS,
                "signups": self.signups(),
                "interest_by_pathway": self.interest_by_pathway(),
                "community_activity": self.community_activity(),
                "feedback_by_category": self.feedback_by_category(),
                "totals": {
                    "people": User.objects.count(),
                    "interest": ExpressionOfInterest.objects.count(),
                    "questions": Question.objects.count(),
                    "answers": Answer.objects.count(),
                    "feedback": Feedback.objects.count(),
                    "open_reports": self.open_reports(),
                },
            }
        )

    def signups(self):
        """Sign-ups per week, split by the three self-registerable types."""
        since = timezone.now() - timedelta(weeks=OVERVIEW_WEEKS)
        rows = (
            Profile.objects.filter(user__date_joined__gte=since)
            .annotate(week=TruncWeek("user__date_joined"))
            .values("week", "user_type")
            .annotate(count=Count("id"))
            .order_by("week")
        )
        weeks = {}
        for row in rows:
            if not row["week"]:
                continue
            key = row["week"].date().isoformat()
            weeks.setdefault(key, {})[row["user_type"]] = row["count"]
        return [{"label": week, "values": values} for week, values in sorted(weeks.items())]

    def interest_by_pathway(self):
        """The share of expressions of interest per pathway, for the ring."""
        counts = dict(
            ExpressionOfInterest.objects.values("pathway__name")
            .annotate(count=Count("id"))
            .values_list("pathway__name", "count")
        )
        # Every pathway appears even on zero, so the legend does not change
        # shape as data arrives. None is "the account never chose one".
        segments = [
            {"label": name, "value": counts.get(name, 0)}
            for name in Pathway.objects.order_by("name").values_list("name", flat=True)
        ]
        unknown = counts.get(None, 0)
        if unknown:
            segments.append({"label": "Not given", "value": unknown})
        return segments

    def community_activity(self):
        """Questions and answers per week, on one pair of bars."""
        questions = _weekly(Question.objects.all())
        answers = _weekly(Answer.objects.all())
        weeks = sorted(set(questions) | set(answers))
        return [
            {
                "label": week,
                "values": {"questions": questions.get(week, 0), "answers": answers.get(week, 0)},
            }
            for week in weeks
        ]

    def feedback_by_category(self):
        counts = dict(
            Feedback.objects.values("category")
            .annotate(count=Count("id"))
            .values_list("category", "count")
        )
        return [
            {"label": value, "value": counts.get(value, 0)}
            for value, _ in Feedback.Category.choices
        ]

    def open_reports(self):
        from community.models import Report

        return Report.objects.filter(resolved=False).count()


class PersonSerializer(serializers.ModelSerializer):
    """
    One account on the People tab.

    NO EMAIL. Most people here are 16 to 18, and CONTEXT.md's rule is to hold
    and show the minimum. Staff who genuinely need to contact somebody have
    the expression-of-interest list, where that person chose to be contacted;
    a directory of every teenager's email address is a different thing, and
    not one this tab needs to do its job (finding and deactivating an account).
    """

    user_type = serializers.CharField(source="profile.user_type", read_only=True, default="")
    questions = serializers.IntegerField(read_only=True)
    answers = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "user_type", "date_joined", "is_active", "questions", "answers"]
        read_only_fields = fields


class PeopleView(generics.ListAPIView):
    """GET /api/accounts/admin-portal/people/?user_type=student&q=ada

    Accounts, newest first, 20 to a page like every other staff list here.
    Post counts come along so staff can see at a glance whether an account
    they are about to deactivate has written anything.
    """

    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        people = User.objects.select_related("profile").annotate(
            questions=Count("community_questions", distinct=True),
            answers=Count("community_answers", distinct=True),
        )

        user_type = self.request.query_params.get("user_type")
        if user_type:
            people = people.filter(profile__user_type=user_type)

        search = (self.request.query_params.get("q") or "").strip()
        if search:
            people = people.filter(username__icontains=search)

        return people.order_by("-date_joined")


class DeactivateView(APIView):
    """POST /api/accounts/admin-portal/people/<id>/deactivate/

    Turns off an account, the same is_active flag the person's own
    "deactivate my account" uses, so nothing new is invented and signing in
    stops working the same way.

    Undone by staff in Django admin, not by the person, which is why the page
    asks for confirmation first.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def post(self, request, pk):
        person = generics.get_object_or_404(User, pk=pk)

        if person == request.user:
            # Nothing technically stops it, but locking yourself out of the
            # portal you are standing in is never what was meant.
            return Response(
                {"detail": "You cannot deactivate your own account here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        person.is_active = False
        person.save(update_fields=["is_active"])
        Profile.objects.filter(user=person).update(
            is_deactivated=True, deactivated_at=timezone.now()
        )
        return Response({"id": person.id, "is_active": False})


class AdminFeedbackSerializer(serializers.ModelSerializer):
    """Feedback as staff read it. The email is here because the sender chose
    to leave it for a reply; unlike the People tab, that is the point of it."""

    username = serializers.CharField(source="user.username", read_only=True, default="")

    class Meta:
        model = Feedback
        fields = ["id", "category", "message", "email", "username", "created_at"]
        read_only_fields = fields


class FeedbackListView(generics.ListAPIView):
    """GET /api/accounts/admin-portal/feedback/?category=bug — newest first."""

    serializer_class = AdminFeedbackSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        feedback = Feedback.objects.select_related("user").order_by("-created_at")
        category = self.request.query_params.get("category")
        return feedback.filter(category=category) if category else feedback
