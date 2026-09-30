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

from providers.models import Provider

from . import date_range
from .models import AdminAuditLog, Feedback, Profile
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


class RemoveAccountView(APIView):
    """POST /api/accounts/admin-portal/people/<id>/remove/

    Body: { "confirm_username": "ada" }

    Deletes the account from the database. It does not switch it off and keep
    the row: the person cannot sign in because there is nobody left to sign
    in as, and their questions, answers, reports, preferences and profile go
    with them (all CASCADE on the models). Feedback they sent stays, with the
    sender blanked, because that row is the site's, not theirs (SET_NULL).

    IRREVERSIBLE, and there is no audit log to say it happened. So:

      * the caller must type the username back (checked here as well as in
        the page, so a script cannot skip the question),
      * you cannot remove yourself, and
      * you cannot remove another staff account or a superuser. Take their
        admin access away first (RevokeStaffView), then remove them: two
        deliberate steps, and no way to wipe out every admin in one go.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def post(self, request, pk):
        person = generics.get_object_or_404(User.objects.select_related("profile"), pk=pk)

        if person == request.user:
            return Response(
                {"detail": "You cannot remove your own account here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if person.is_superuser or _is_staff_account(person):
            return Response(
                {"detail": "Remove their admin access first, then remove the account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.data.get("confirm_username") != person.username:
            return Response(
                {"confirm_username": ["Type the username exactly to confirm."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        person_id = person.id
        person.delete()
        return Response({"id": person_id, "deleted": True})


class RevokeStaffView(APIView):
    """POST /api/accounts/admin-portal/people/<id>/revoke-staff/

    Takes admin access away: the account goes back to a student, the same
    change `manage.py make_staff --revoke` makes. The person keeps their
    account and everything they wrote.

    You cannot do it to yourself, which also means the last admin can never
    remove the last admin: whoever is calling is staff, and is never the
    target, so at least one staff account is always left standing.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def post(self, request, pk):
        person = generics.get_object_or_404(User.objects.select_related("profile"), pk=pk)

        if person == request.user:
            return Response(
                {"detail": "You cannot remove your own admin access."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not _is_staff_account(person):
            return Response(
                {"detail": "That account is not an admin."}, status=status.HTTP_400_BAD_REQUEST
            )

        Profile.objects.filter(user=person).update(user_type=Profile.UserType.STUDENT)
        return Response({"id": person.id, "user_type": Profile.UserType.STUDENT})


def _is_staff_account(user):
    profile = getattr(user, "profile", None)
    return getattr(profile, "user_type", None) == Profile.UserType.AMAZON_STAFF


class AdminFeedbackSerializer(serializers.ModelSerializer):
    """Feedback as staff read it. The email is here because the sender chose
    to leave it for a reply; unlike the People tab, that is the point of it.

    handled_by is the NAME, not the id: the only thing anybody does with it is
    read who dealt with this, and the id would be one more thing to look up.
    """

    username = serializers.CharField(source="user.username", read_only=True, default="")
    handled_by = serializers.CharField(source="handled_by.username", read_only=True, default="")

    class Meta:
        model = Feedback
        fields = [
            "id",
            "category",
            "message",
            "email",
            "username",
            "created_at",
            "handled",
            "handled_by",
            "handled_at",
            "admin_note",
        ]
        read_only_fields = fields


class FeedbackListView(generics.ListAPIView):
    """GET /api/accounts/admin-portal/feedback/?category=bug&handled=false

    Newest first. `handled` takes true/false; anything else is ignored, so a
    stray value in a shared URL shows everything rather than nothing.
    """

    serializer_class = AdminFeedbackSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        feedback = (
            Feedback.objects.select_related("user", "handled_by").order_by("-created_at")
        )

        category = self.request.query_params.get("category")
        if category:
            feedback = feedback.filter(category=category)

        handled = (self.request.query_params.get("handled") or "").lower()
        if handled in {"true", "false"}:
            feedback = feedback.filter(handled=handled == "true")

        return feedback


class AuditLogSerializer(serializers.ModelSerializer):
    """One recorded staff action, as the Audit log tab reads it."""

    # The stored name, not actor.username: actor goes NULL when that staff
    # account is removed, and the whole point of the copy is that the record
    # survives them.
    actor = serializers.CharField(source="actor_username", read_only=True)
    action_label = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = [
            "id",
            "actor",
            "action",
            "action_label",
            "target_type",
            "target_label",
            "detail",
            "created_at",
        ]
        read_only_fields = fields


class AuditLogView(generics.ListAPIView):
    """GET /api/accounts/admin-portal/audit-log/?actor=ada&action=post_deleted

    Read-only, and deliberately so: an audit log with an edit button on it is
    not an audit log. Rows are only ever written by record().
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        return filtered_audit_log(self.request)


def filtered_audit_log(request):
    """The audit log narrowed by the query string. Shared with the CSV export."""
    entries = AdminAuditLog.objects.all()

    actor = (request.query_params.get("actor") or "").strip()
    if actor:
        entries = entries.filter(actor_username__icontains=actor)

    action = request.query_params.get("action")
    if action:
        entries = entries.filter(action=action)

    window = date_range.from_request(request)
    if request.query_params.get("range"):
        entries = entries.filter(**window.filter_for("created_at"))

    return entries


class ProviderSerializer(serializers.ModelSerializer):
    """
    A provider on the read-only Providers tab.

    `placed` is the same test `manage.py check_providers` uses: a provider at
    exactly 0,0 is one whose postcode nothing could be found for, not one in
    the Atlantic.
    """

    placed = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = ["id", "name", "postcode", "region", "provider_type", "placed"]
        read_only_fields = fields

    def get_placed(self, provider):
        return not (provider.latitude == 0 and provider.longitude == 0)


class ProvidersView(generics.ListAPIView):
    """GET /api/accounts/admin-portal/providers/?placed=false&region=North West

    Read-only. Editing providers stays in Django admin, which already has the
    forms and the validation for it; this tab exists to find the ones whose
    postcode needs fixing.
    """

    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        return filtered_providers(self.request)


def filtered_providers(request):
    """Providers narrowed by the query string. Shared with the CSV export."""
    providers = Provider.objects.all().order_by("name")

    region = (request.query_params.get("region") or "").strip()
    if region:
        providers = providers.filter(region=region)

    placed = (request.query_params.get("placed") or "").lower()
    if placed == "false":
        providers = providers.filter(latitude=0, longitude=0)
    elif placed == "true":
        providers = providers.exclude(latitude=0, longitude=0)

    return providers
