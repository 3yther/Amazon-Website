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


# The most rows one request may act on.
#
# Not a performance limit: it is there so a mistake is survivable. Selecting
# everything on a page is one click, and "delete 12 posts" and "delete 4,000
# posts" should not be the same amount of effort to ask for by accident.
BULK_LIMIT = 100


class BulkActionView(AdminActionView):
    """POST /api/accounts/admin-portal/bulk/

    Body: { "action": "posts_delete", "ids": [1, 2, 3] }

    PER-ITEM RESULTS, NOT ALL-OR-NOTHING. Twelve selected posts where one has
    already been deleted by somebody else should delete the other eleven and
    say so, not fail the lot. Every item comes back with whether it worked and
    why not, and the response is 200 even when some failed, because the
    request itself was fine; the page reads the results.

    ONE AUDIT ENTRY PER ITEM. A batch entry with a list of ids in it would be
    invisible when somebody later filters the log by the account they are
    looking for, which is the question the log usually gets asked.
    """

    def post(self, request):
        action = request.data.get("action")
        ids = request.data.get("ids")

        handler = BULK_ACTIONS.get(action)
        if handler is None:
            return Response(
                {"action": ["Unknown action."]}, status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(ids, list) or not ids:
            return Response({"ids": ["Choose at least one."]}, status=status.HTTP_400_BAD_REQUEST)

        if len(ids) > BULK_LIMIT:
            return Response(
                {"ids": [f"That is more than {BULK_LIMIT} at once."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = []
        for item_id in ids:
            try:
                ok, reason = handler(request, item_id)
            except Exception:  # noqa: BLE001 - one bad row must not stop the rest
                ok, reason = False, "failed"
            results.append({"id": item_id, "ok": ok, "reason": "" if ok else reason})

        return Response(
            {
                "results": results,
                "done": sum(1 for row in results if row["ok"]),
                "failed": sum(1 for row in results if not row["ok"]),
            }
        )


def _bulk_feedback_handled(request, item_id):
    feedback = Feedback.objects.filter(pk=item_id).first()
    if feedback is None:
        return False, "gone"

    feedback.handled = True
    feedback.handled_by = request.user
    feedback.handled_at = timezone.now()
    feedback.save(update_fields=["handled", "handled_by", "handled_at"])

    record(
        request,
        AdminAuditLog.Action.FEEDBACK_HANDLED,
        target=feedback,
        target_label=feedback.get_category_display(),
        detail={"handled": True, "bulk": True},
    )
    return True, ""


def _bulk_report(request, item_id, dismiss=False):
    report = Report.objects.filter(pk=item_id).first()
    if report is None:
        return False, "gone"

    report.resolved = True
    report.save(update_fields=["resolved"])

    record(
        request,
        AdminAuditLog.Action.REPORT_DISMISSED if dismiss else AdminAuditLog.Action.REPORT_RESOLVED,
        target=report,
        target_label=report.reason or str(report.pk),
        detail={"bulk": True},
    )
    return True, ""


def _bulk_post_deleted(request, item_id):
    """Deletes the post a report points at, the same as the single action."""
    from community.models import Question

    report = Report.objects.filter(pk=item_id).select_related("question", "answer").first()
    if report is None:
        return False, "gone"

    post = report.question or report.answer
    if post is None:
        return False, "gone"

    label = (getattr(post, "title", "") or getattr(post, "body", ""))[:80]
    answers = post.answers.count() if isinstance(post, Question) else 0
    post.delete()

    record(
        request,
        AdminAuditLog.Action.POST_DELETED,
        target_label=label,
        detail={"bulk": True, "answers_deleted": answers},
    )
    return True, ""


def _bulk_account_removed(request, item_id):
    """
    The same three refusals the single removal has, checked per item.

    A bulk control is exactly where these matter most: the whole point of one
    is that nobody reads every row before pressing the button.
    """
    person = User.objects.filter(pk=item_id).select_related("profile").first()
    if person is None:
        return False, "gone"

    if person == request.user:
        return False, "yourself"

    if person.is_superuser or getattr(
        getattr(person, "profile", None), "user_type", None
    ) == Profile.UserType.AMAZON_STAFF:
        return False, "staff"

    username = person.username
    person.delete()

    record(
        request,
        AdminAuditLog.Action.ACCOUNT_REMOVED,
        target_label=username,
        detail={"bulk": True, "username": username},
    )
    return True, ""


BULK_ACTIONS = {
    "feedback_handled": _bulk_feedback_handled,
    "reports_resolve": lambda request, item_id: _bulk_report(request, item_id),
    "reports_dismiss": lambda request, item_id: _bulk_report(request, item_id, dismiss=True),
    "posts_delete": _bulk_post_deleted,
    "people_remove": _bulk_account_removed,
}
