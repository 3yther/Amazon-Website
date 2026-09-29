"""
Things staff DO in the Admin Portal, as opposed to things they read.

Every view here is behind IsAmazonStaffAndUnlocked and every one of them ends
by calling record(), because these are the actions somebody may need to account
for later. The reading views live in admin_portal.py and admin_dashboard.py.

TWO RULES THAT ARE NOT NEGOTIABLE HERE.

STAFF ARE NOT CHANGED BY THESE. The role endpoint moves an account between
student, parent and teacher only. Making somebody staff stays in Django admin
and unmaking them stays in RevokeStaffView, both deliberate separate steps. An
endpoint that could hand out staff access would make the portal's own gate
pointless, since the way in would be through the portal.

THE RESET ENDPOINT NEVER SAYS WHETHER AN EMAIL EXISTS. It answers the same way
whether the account has an address or not, because the public reset form has
that property and an endpoint that leaks it would undo the reason.
"""
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from community.models import Report

from .audit import record
from .emails import send_password_reset_email
from .models import AdminAuditLog, Feedback, Profile
from .permissions import IsAmazonStaffAndUnlocked

#: Roles the People drawer may move somebody between. Staff is not one.
ASSIGNABLE_ROLES = {
    Profile.UserType.STUDENT,
    Profile.UserType.PARENT,
    Profile.UserType.TEACHER,
}


class AdminActionView(APIView):
    """The gate every action here shares."""

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]


class BadgeCountsView(AdminActionView):
    """GET /api/accounts/admin-portal/badges/

    The small numbers beside the sidebar's sections. Two counts, two queries,
    no rows fetched: this is polled after every action, so it has to stay
    cheap enough that nobody thinks twice about refreshing it.
    """

    def get(self, request):
        return Response(
            {
                "unhandled_feedback": Feedback.objects.filter(handled=False).count(),
                "open_reports": Report.objects.filter(resolved=False).count(),
            }
        )


class FeedbackHandleView(AdminActionView):
    """POST /api/accounts/admin-portal/feedback/<id>/handle/

    Body: { "handled": true, "admin_note": "replied by email" }

    Marks one piece of feedback dealt with, or puts it back. The note is for
    staff only and is never shown to whoever sent the feedback.
    """

    def post(self, request, pk):
        feedback = generics.get_object_or_404(Feedback, pk=pk)

        handled = request.data.get("handled")
        if not isinstance(handled, bool):
            return Response(
                {"handled": ["Say true or false."]}, status=status.HTTP_400_BAD_REQUEST
            )

        feedback.handled = handled
        # Who and when are cleared when it goes back to unhandled, so the row
        # never claims somebody dealt with something that is still open.
        feedback.handled_by = request.user if handled else None
        feedback.handled_at = timezone.now() if handled else None

        if "admin_note" in request.data:
            feedback.admin_note = str(request.data.get("admin_note") or "")[:2000]

        feedback.save(update_fields=["handled", "handled_by", "handled_at", "admin_note"])

        record(
            request,
            AdminAuditLog.Action.FEEDBACK_HANDLED,
            target=feedback,
            target_label=feedback.get_category_display(),
            detail={"handled": handled, "has_note": bool(feedback.admin_note)},
        )

        return Response(
            {
                "id": feedback.id,
                "handled": feedback.handled,
                "handled_by": request.user.username if handled else "",
                "handled_at": feedback.handled_at,
                "admin_note": feedback.admin_note,
            }
        )


class ChangeRoleView(AdminActionView):
    """POST /api/accounts/admin-portal/people/<id>/role/

    Body: { "user_type": "teacher" }

    Between student, parent and teacher only. See the module docstring for why
    staff is not in that list, in either direction.
    """

    def post(self, request, pk):
        person = generics.get_object_or_404(User.objects.select_related("profile"), pk=pk)
        wanted = request.data.get("user_type")

        if wanted not in ASSIGNABLE_ROLES:
            return Response(
                {"user_type": ["Choose student, parent or teacher."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        current = getattr(getattr(person, "profile", None), "user_type", None)

        # Staff are not moved from here, in either direction. Taking staff
        # access away is RevokeStaffView, which is a deliberate separate step.
        if current == Profile.UserType.AMAZON_STAFF or person.is_superuser:
            return Response(
                {"detail": "Take their admin access away first, in the staff controls."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if current == wanted:
            return Response({"id": person.id, "user_type": wanted})

        Profile.objects.filter(user=person).update(user_type=wanted)

        record(
            request,
            AdminAuditLog.Action.ROLE_CHANGED,
            target=person,
            target_label=person.username,
            detail={"from": current, "to": wanted},
        )

        return Response({"id": person.id, "user_type": wanted})


class SendPasswordResetView(AdminActionView):
    """POST /api/accounts/admin-portal/people/<id>/password-reset/

    Sends the ordinary reset email, the same one the public form sends.

    The answer is the same whether the account has an email address or not.
    The public form works that way so nobody can use it to find out which
    addresses exist, and an endpoint that reported "no email on file" would
    hand a staff account a way round that. The audit entry records which it
    was, because that IS worth knowing later.
    """

    def post(self, request, pk):
        person = generics.get_object_or_404(User, pk=pk)
        sent = bool(person.email)

        if sent:
            send_password_reset_email(person)

        record(
            request,
            AdminAuditLog.Action.PASSWORD_RESET_SENT,
            target=person,
            target_label=person.username,
            detail={"had_email": sent},
        )

        # Deliberately the same body either way.
        return Response({"id": person.id, "sent": True})


class PersonDetailSerializer(serializers.ModelSerializer):
    """
    One account, as the drawer shows it.

    STILL NO EMAIL. The People table deliberately has none (most people here
    are 16 to 18, and CONTEXT.md's rule is to hold and show the minimum), and
    opening a drawer is not a reason to widen that. Search may MATCH on an
    address, because narrowing a list is not the same as publishing one, but
    nothing here returns it.
    """

    user_type = serializers.CharField(source="profile.user_type", read_only=True, default="")
    pathway = serializers.CharField(
        source="profile.pathway_interest", read_only=True, default=""
    )
    questions = serializers.IntegerField(read_only=True)
    answers = serializers.IntegerField(read_only=True)
    reports_made = serializers.IntegerField(read_only=True)
    feedback_sent = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "user_type",
            "pathway",
            "date_joined",
            "last_login",
            "is_active",
            "is_superuser",
            "questions",
            "answers",
            "reports_made",
            "feedback_sent",
        ]
        read_only_fields = fields


class PersonDetailView(generics.RetrieveAPIView):
    """GET /api/accounts/admin-portal/people/<id>/

    Everything the drawer shows, counted in one query rather than five
    round trips as the drawer opens.
    """

    serializer_class = PersonDetailSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        return User.objects.select_related("profile").annotate(
            questions=Count("community_questions", distinct=True),
            answers=Count("community_answers", distinct=True),
            reports_made=Coalesce(
                Subquery(
                    Report.objects.filter(reporter=OuterRef("pk"))
                    .values("reporter")
                    .annotate(total=Count("id"))
                    .values("total")[:1]
                ),
                0,
            ),
            feedback_sent=Count("feedback_submissions", distinct=True),
        )
