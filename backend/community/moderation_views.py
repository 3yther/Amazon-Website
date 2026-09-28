"""
The Admin Portal's Reported posts tab.

Kept next to the models it acts on rather than in accounts/, but behind the
same gate as the rest of the portal: Amazon staff AND the PIN
(accounts.permissions.IsAmazonStaffAndUnlocked).

Three actions, and the difference between them matters:

  hide     reversible, the post stays in the database, its author still sees
           it with a note. This is the everyday one.
  restore  puts a hidden post back.
  delete   gone. A question takes its answers with it, by the model's own
           CASCADE. Irreversible, so the page asks before it fires.
"""
from django.db.models import Count, Q
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAmazonStaffAndUnlocked

from .models import Answer, Question, Report


class ReportedPostSerializer(serializers.ModelSerializer):
    """
    One reported post, flattened so the tab does not need to know whether it
    is looking at a question or an answer: both have a kind, an id, some text,
    an author and a hidden flag.
    """

    kind = serializers.SerializerMethodField()
    post_id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    hidden = serializers.SerializerMethodField()
    reporter = serializers.CharField(source="reporter.username", read_only=True, default="")

    class Meta:
        model = Report
        fields = [
            "id",
            "kind",
            "post_id",
            "title",
            "body",
            "author",
            "hidden",
            "reason",
            "note",
            "reporter",
            "resolved",
            "created_at",
        ]
        read_only_fields = fields

    def _post(self, report):
        return report.question or report.answer

    def get_kind(self, report):
        return "question" if report.question_id else "answer"

    def get_post_id(self, report):
        post = self._post(report)
        return post.id if post else None

    def get_title(self, report):
        return report.question.title if report.question_id else ""

    def get_body(self, report):
        post = self._post(report)
        return post.body if post else ""

    def get_author(self, report):
        post = self._post(report)
        return post.author.username if post else ""

    def get_hidden(self, report):
        post = self._post(report)
        return bool(post and post.hidden)


class ReportListView(generics.ListAPIView):
    """GET /api/community/admin-portal/reports/?resolved=false

    Reports, unresolved first (the model's own ordering), 20 to a page like
    every other staff list here.
    """

    serializer_class = ReportedPostSerializer
    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get_queryset(self):
        reports = Report.objects.select_related(
            "reporter", "question", "question__author", "answer", "answer__author"
        )
        resolved = self.request.query_params.get("resolved")
        if resolved == "true":
            reports = reports.filter(resolved=True)
        elif resolved == "false":
            reports = reports.filter(resolved=False)
        return reports


class ReportActionView(APIView):
    """
    POST /api/community/admin-portal/reports/<id>/<action>/

    action is hide, restore, delete or resolve. Takes the report rather than
    the post, because that is what staff are looking at, and it lets the
    report be marked dealt-with in the same move.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]
    action = None

    @classmethod
    def as_view(cls, **initkwargs):
        return super().as_view(**initkwargs)

    def post(self, request, pk):
        report = generics.get_object_or_404(
            Report.objects.select_related("question", "answer"), pk=pk
        )
        post = report.question or report.answer
        if post is None:
            return Response(
                {"detail": "That post has already gone."}, status=status.HTTP_404_NOT_FOUND
            )

        if self.action == "hide":
            post.hide("staff")
            report.resolved = True
            report.save(update_fields=["resolved"])
            return Response({"hidden": True, "resolved": True})

        if self.action == "restore":
            post.hidden = False
            post.hidden_reason = ""
            post.save(update_fields=["hidden", "hidden_reason"])
            return Response({"hidden": False})

        if self.action == "resolve":
            report.resolved = True
            report.save(update_fields=["resolved"])
            return Response({"resolved": True})

        if self.action == "delete":
            # A question takes its answers, its reports and its helpful marks
            # with it: every one of those is on_delete=CASCADE on the model.
            # Counted before the delete so the answer can say what went.
            answers = post.answers.count() if isinstance(post, Question) else 0
            post.delete()
            return Response({"deleted": True, "answers_deleted": answers})

        return Response({"detail": "Unknown action."}, status=status.HTTP_400_BAD_REQUEST)


class ReportedCountsView(APIView):
    """GET /api/community/admin-portal/reports/counts/ — for the tab's badge."""

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get(self, request):
        counts = Report.objects.aggregate(
            total=Count("id"),
            open=Count("id", filter=Q(resolved=False)),
        )
        return Response(counts)
