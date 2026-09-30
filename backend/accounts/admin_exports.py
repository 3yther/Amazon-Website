"""
CSV exports for the Admin Portal.

Every export here obeys four rules, and they are the reason this is a module
rather than a method on each list view:

THE CURRENT FILTERS, ALL THE ROWS. An export is taken from a view somebody has
already narrowed, so it reuses the same filtering the list uses and sends every
matching row, not the page on screen. A file that quietly holds twenty of four
hundred rows is worse than no file.

THE SAME PERMISSION AS THE LIST. IsAmazonStaffAndUnlocked, exactly like the
list it exports. An export is a read of the same data; it must not be a way
round the gate that guards it.

NO MORE THAN THE TABLE SHOWS. The People export carries the People columns and
nothing else. In particular no email: the People tab deliberately has none
(most people here are 16 to 18, and CONTEXT.md's rule is to hold and show the
minimum), and an export is not the place to quietly widen that.

WRITTEN DOWN. Every export is recorded in the audit log with the filters it
used, because "who pulled a list of every account, and when" is exactly the
kind of question the audit log exists to answer.
"""
import json

from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import date_range
from .admin_dashboard import DashboardChartsView, DashboardView
from .audit import record
from .csv_export import stream_csv
from interest.models import ExpressionOfInterest

from .models import AdminAuditLog
from .permissions import IsAmazonStaffAndUnlocked


class BaseExportView(APIView):
    """Shared gate, throttle and audit entry for every export."""

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "admin_export"

    #: What the audit entry and the filename call this export.
    export_name = ""

    def audit(self, request, rows=None):
        record(
            request,
            AdminAuditLog.Action.CSV_EXPORTED,
            target_label=self.export_name,
            detail={
                "export": self.export_name,
                # The filters matter as much as the fact: "exported the
                # accounts list" and "exported every account ever" are
                # different events.
                "filters": {
                    key: value
                    for key, value in request.query_params.items()
                    if key in {"range", "from", "to", "user_type", "pathway", "q"}
                },
                **({"rows": rows} if rows is not None else {}),
            },
        )


class PeopleCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/people/export/?user_type=student&q=ada

    The People tab as a spreadsheet, with the same filters and the same
    columns the table shows.
    """

    export_name = "people"

    def get(self, request):
        people = (
            User.objects.select_related("profile")
            .annotate(
                questions=Count("community_questions", distinct=True),
                answers=Count("community_answers", distinct=True),
            )
            .order_by("-date_joined")
        )

        user_type = request.query_params.get("user_type")
        if user_type:
            people = people.filter(profile__user_type=user_type)

        search = (request.query_params.get("q") or "").strip()
        if search:
            people = people.filter(username__icontains=search)

        window = date_range.from_request(request)
        if request.query_params.get("range"):
            people = people.filter(**window.filter_for("date_joined"))

        self.audit(request, rows=people.count())

        # .iterator() so a big export is streamed out of the database rather
        # than loaded into a list first.
        def rows():
            for person in people.iterator():
                yield [
                    person.id,
                    person.username,
                    getattr(getattr(person, "profile", None), "user_type", ""),
                    person.date_joined,
                    person.last_login,
                    person.is_active,
                    person.questions,
                    person.answers,
                ]

        return stream_csv(
            "people",
            # Stable English column names: these files get pasted into other
            # tools, and a column that changes name with the interface
            # language breaks whatever reads them.
            [
                "ID",
                "Username",
                "Account type",
                "Joined",
                "Last signed in",
                "Active",
                "Questions",
                "Answers",
            ],
            rows(),
        )


class OverviewCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/dashboard/export/?range=90d

    The Overview as a spreadsheet: every KPI, then every chart series, for the
    range on screen. One long two-part file rather than eleven downloads,
    because the question being asked is "what did this period look like".
    """

    export_name = "overview"

    def get(self, request):
        window = date_range.from_request(request)
        kpis = DashboardView().kpis(window)
        charts = DashboardChartsView().get(request).data

        self.audit(request)

        def rows():
            yield ["KPI", "", "Value", "Previous", "Change", "Percent"]
            for card in kpis:
                yield [
                    card["key"],
                    "",
                    card["value"],
                    card["previous"],
                    card["change"],
                    card["percent"],
                ]

            # A blank line, then the series, so one file holds both without
            # the two halves running into each other in a spreadsheet.
            yield []
            yield ["Chart", "Label", "Series", "Value", "", ""]
            for name, series in charts.items():
                if name == "range" or not isinstance(series, list):
                    continue
                for row in series:
                    if "values" in row:
                        for key, value in row["values"].items():
                            yield [name, row["label"], key, value, "", ""]
                    else:
                        yield [name, row["label"], "", row["value"], "", ""]

        return stream_csv("overview", ["Section", "Label", "Series", "Value", "A", "B"], rows())


class AuditLogCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/audit-log/export/?actor=ada

    The audit log itself. Exporting it is also an auditable action, so this
    writes its own entry, which will appear in the next export. That is not a
    bug: "who took a copy of the log" is exactly the sort of thing the log is
    for.
    """

    export_name = "audit-log"

    def get(self, request):
        from .admin_portal import filtered_audit_log

        entries = filtered_audit_log(request)
        self.audit(request, rows=entries.count())

        def rows():
            for entry in entries.iterator():
                yield [
                    entry.created_at,
                    entry.actor_username,
                    entry.get_action_display(),
                    entry.target_type,
                    entry.target_label,
                    # The detail is small structured data; JSON keeps it
                    # readable in one cell rather than inventing columns that
                    # differ per action.
                    json.dumps(entry.detail, ensure_ascii=False) if entry.detail else "",
                ]

        return stream_csv(
            "audit-log",
            ["When", "Who", "What", "Target type", "Target", "Detail"],
            rows(),
        )


class ProvidersCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/providers/export/?placed=false"""

    export_name = "providers"

    def get(self, request):
        from .admin_portal import filtered_providers

        providers = filtered_providers(request)
        self.audit(request, rows=providers.count())

        def rows():
            for provider in providers.iterator():
                placed = not (provider.latitude == 0 and provider.longitude == 0)
                yield [
                    provider.name,
                    provider.postcode,
                    provider.get_region_display(),
                    provider.get_provider_type_display(),
                    placed,
                ]

        return stream_csv(
            "providers",
            ["Name", "Postcode", "Region", "Type", "On the map"],
            rows(),
        )


class FeedbackCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/feedback/export/?category=bug&handled=false

    The Feedback tab's columns, including the email, because that tab shows it:
    whoever sent the feedback left the address for a reply, which is the
    opposite of the People tab's situation.
    """

    export_name = "feedback"

    def get(self, request):
        from .admin_portal import FeedbackListView

        view = FeedbackListView()
        view.request = request
        feedback = view.get_queryset()

        self.audit(request, rows=feedback.count())

        def rows():
            for item in feedback.iterator():
                yield [
                    item.created_at,
                    item.get_category_display(),
                    item.message,
                    item.email,
                    item.user.username if item.user else "",
                    item.handled,
                    item.handled_by.username if item.handled_by else "",
                    item.handled_at,
                    item.admin_note,
                ]

        return stream_csv(
            "feedback",
            [
                "Sent",
                "Category",
                "Message",
                "Email",
                "Username",
                "Dealt with",
                "Dealt with by",
                "Dealt with at",
                "Staff note",
            ],
            rows(),
        )


class InterestCsvView(BaseExportView):
    """GET /api/accounts/admin-portal/interest/export/

    The expressions of interest. This one DOES carry names and emails, because
    that is the whole point of the form: everybody in it asked to be contacted.
    """

    export_name = "interest"

    def get(self, request):
        submissions = ExpressionOfInterest.objects.select_related(
            "user", "pathway"
        ).order_by("-submitted_at")

        window = date_range.from_request(request)
        if request.query_params.get("range"):
            submissions = submissions.filter(**window.filter_for("submitted_at"))

        self.audit(request, rows=submissions.count())

        def rows():
            for row in submissions.iterator():
                yield [
                    row.submitted_at,
                    row.full_name,
                    row.email,
                    row.user_type,
                    row.pathway.name if row.pathway else "",
                    row.message,
                ]

        return stream_csv(
            "interest",
            ["Sent", "Name", "Email", "They are a", "Pathway", "Message"],
            rows(),
        )
