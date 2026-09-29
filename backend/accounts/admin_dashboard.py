"""
The Admin Portal dashboard: the KPI cards and the charts behind them.

Separate from admin_portal.py, which is the gate, the People tab and the
original four charts. This is the numbers.

TWO RULES THROUGHOUT.

COUNTED IN THE DATABASE. Every number here is an aggregate, never a queryset
pulled into Python and tallied. A year of sign-ups is one row out of the
database either way; the difference is whether it is one row or forty thousand.

CURRENT AND PREVIOUS IN ONE QUERY. Each KPI is shown against the period before
it, which is the obvious way to double the query count. Conditional aggregation
(Count with a filter=) answers both windows in a single pass, so adding the
comparison cost nothing. tests_admin_dashboard.py pins the total with
assertNumQueries so this cannot quietly regress into N+1.
"""
from django.contrib.auth.models import User
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F, Min, Q
from django.db.models.functions import TruncDay, TruncWeek
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from community.models import Answer, Question, Report
from content.models import Pathway
from interest.models import ExpressionOfInterest

from . import date_range
from .models import Feedback, Profile, UserPreference
from .permissions import IsAmazonStaffAndUnlocked

# A sparkline is a shape, not a reading. Enough points to show a direction,
# few enough to draw a few millimetres tall without turning into noise.
SPARK_BUCKETS = 12


def _counts(queryset, field, window):
    """
    (current, previous) for one model, in one query.

    `previous` is None when the range is all-time, because there is nothing
    before "everything" to compare against.
    """
    current = Q(**window.filter_for(field))
    previous_filter = window.previous_filter_for(field)

    aggregates = {"current": Count("id", filter=current)}
    if previous_filter:
        aggregates["previous"] = Count("id", filter=Q(**previous_filter))

    row = queryset.aggregate(**aggregates)
    return row["current"], row.get("previous")


def _spark(queryset, field, window):
    """
    A short series over the window, for the line under a KPI.

    Buckets by day for a short range and by week for a long one, so twelve
    months does not come back as 365 points to draw at 40 pixels wide.
    """
    long_range = window.start is None or (window.end - window.start).days > 60
    truncate = TruncWeek if long_range else TruncDay

    rows = (
        queryset.filter(**window.filter_for(field))
        .annotate(bucket=truncate(field))
        .values("bucket")
        .annotate(count=Count("id"))
        .order_by("bucket")
    )
    points = [row["count"] for row in rows if row["bucket"]]
    return points[-SPARK_BUCKETS:]


def _kpi(key, current, previous, window, spark=None, unit="count"):
    return {
        "key": key,
        "value": current,
        "unit": unit,
        "spark": spark or [],
        **date_range.change_between(current, previous, window.has_previous),
    }


class DashboardView(APIView):
    """GET /api/accounts/admin-portal/dashboard/?range=30d

    The KPI cards. Each carries its value, the same number for the period
    before, the absolute and percentage change, and a sparkline.

    `percent` is null when the previous period was empty or the range is
    all-time. Four sign-ups after a month of none is not an infinite rise, and
    the card says "new" rather than printing a number that means nothing.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get(self, request):
        window = date_range.from_request(request)

        return Response(
            {
                "range": window.as_json(),
                "kpis": self.kpis(window),
            }
        )

    def kpis(self, window):
        cards = []

        # Accounts is cumulative: how many existed at the end of each window,
        # not how many were made during it. That is what "total accounts"
        # means on a card, and it is a different question from sign-ups below.
        total_now = User.objects.filter(date_joined__lte=window.end).count()
        total_before = (
            User.objects.filter(date_joined__lt=window.previous_end).count()
            if window.has_previous
            else None
        )
        cards.append(_kpi("accounts", total_now, total_before, window))

        signups, signups_before = _counts(User.objects.all(), "date_joined", window)
        cards.append(
            _kpi(
                "signups",
                signups,
                signups_before,
                window,
                _spark(User.objects.all(), "date_joined", window),
            )
        )

        # Anyone who signed in during the window. last_login is null for an
        # account that has never signed in, which the range filter excludes.
        active, active_before = _counts(User.objects.all(), "last_login", window)
        cards.append(
            _kpi(
                "active",
                active,
                active_before,
                window,
                _spark(User.objects.all(), "last_login", window),
            )
        )

        # Interest stamps its rows submitted_at, not created_at.
        interest, interest_before = _counts(
            ExpressionOfInterest.objects.all(), "submitted_at", window
        )
        cards.append(
            _kpi(
                "interest",
                interest,
                interest_before,
                window,
                _spark(ExpressionOfInterest.objects.all(), "submitted_at", window),
            )
        )

        questions, questions_before = _counts(Question.objects.all(), "created_at", window)
        cards.append(
            _kpi(
                "questions",
                questions,
                questions_before,
                window,
                _spark(Question.objects.all(), "created_at", window),
            )
        )

        answers, answers_before = _counts(Answer.objects.all(), "created_at", window)
        cards.append(
            _kpi(
                "answers",
                answers,
                answers_before,
                window,
                _spark(Answer.objects.all(), "created_at", window),
            )
        )

        # Asked in the window and still with nothing under it. The one number
        # here that is a job list rather than a statistic.
        unanswered = Question.objects.annotate(replies=Count("answers")).filter(replies=0)
        unanswered_now, unanswered_before = _counts(unanswered, "created_at", window)
        cards.append(_kpi("unanswered", unanswered_now, unanswered_before, window))

        feedback, feedback_before = _counts(Feedback.objects.all(), "created_at", window)
        cards.append(
            _kpi(
                "feedback",
                feedback,
                feedback_before,
                window,
                _spark(Feedback.objects.all(), "created_at", window),
            )
        )

        # Open reports is a "right now" number: how big the queue is, not how
        # many arrived. Compared against how many were open at the end of the
        # previous window, which is the same question asked earlier.
        open_now = Report.objects.filter(resolved=False, created_at__lte=window.end).count()
        open_before = (
            Report.objects.filter(resolved=False, created_at__lt=window.previous_end).count()
            if window.has_previous
            else None
        )
        cards.append(_kpi("open_reports", open_now, open_before, window))

        cards.append(self.time_to_first_answer(window))
        return cards

    def time_to_first_answer(self, window):
        """
        Average hours between a question being asked and its first answer.

        Only questions that have an answer count. Including the unanswered
        ones as some huge number would make the average say more about how
        long the site has existed than about how fast anybody replies, and
        "how many are unanswered" already has its own card.
        """

        def average(filters):
            if filters is None:
                return None
            row = (
                Question.objects.filter(**filters)
                .annotate(first_answer=Min("answers__created_at"))
                .filter(first_answer__isnull=False)
                .annotate(
                    wait=ExpressionWrapper(
                        F("first_answer") - F("created_at"), output_field=DurationField()
                    )
                )
                .aggregate(average=Avg("wait"))
            )
            waited = row["average"]
            return round(waited.total_seconds() / 3600, 1) if waited else None

        current = average(window.filter_for("created_at"))
        previous = average(window.previous_filter_for("created_at"))

        card = _kpi("time_to_first_answer", current or 0, previous, window, unit="hours")
        # A faster reply is a smaller number, so the page must not colour a
        # fall as a loss. It is told which way is good rather than guessing.
        card["lower_is_better"] = True
        return card


class DashboardChartsView(APIView):
    """GET /api/accounts/admin-portal/dashboard/charts/?range=30d

    The series behind each chart, in the same dull {label, value} and
    {label, values} shapes admin_portal.py already uses, so the front end can
    draw a bar, a ring or a table from any of them and the accessible text
    fallback is the same numbers rather than a second source of truth.
    """

    permission_classes = [IsAuthenticated, IsAmazonStaffAndUnlocked]

    def get(self, request):
        window = date_range.from_request(request)

        return Response(
            {
                "range": window.as_json(),
                "signups_over_time": self.signups_over_time(window),
                "users_by_type": self.users_by_type(window),
                "interest_by_pathway": self.interest_by_pathway(window),
                "community_activity": self.community_activity(window),
                "answer_rate": self.answer_rate(window),
                "active_topics": self.active_topics(window),
                "feedback_over_time": self.feedback_over_time(window),
                "reports_activity": self.reports_activity(window),
                "languages": self.languages(),
                "provider_coverage": self.provider_coverage(),
            }
        )

    # ---- helpers ---------------------------------------------------------

    @staticmethod
    def _bucketed(queryset, field, window, truncate=None):
        long_range = window.start is None or (window.end - window.start).days > 60
        chosen = truncate or (TruncWeek if long_range else TruncDay)
        return (
            queryset.filter(**window.filter_for(field))
            .annotate(bucket=chosen(field))
            .values("bucket")
        )

    # ---- charts ----------------------------------------------------------

    def signups_over_time(self, window):
        """Sign-ups per bucket, split by the three self-registerable types."""
        rows = (
            self._bucketed(Profile.objects.all(), "user__date_joined", window)
            .values("bucket", "user_type")
            .annotate(count=Count("id"))
            .order_by("bucket")
        )
        buckets = {}
        for row in rows:
            if not row["bucket"]:
                continue
            key = row["bucket"].date().isoformat()
            buckets.setdefault(key, {})[row["user_type"]] = row["count"]
        return [{"label": key, "values": values} for key, values in sorted(buckets.items())]

    def users_by_type(self, window):
        counts = dict(
            Profile.objects.filter(**window.filter_for("user__date_joined"))
            .values("user_type")
            .annotate(count=Count("id"))
            .values_list("user_type", "count")
        )
        return [
            {"label": value, "value": counts.get(value, 0)}
            for value, _ in Profile.UserType.choices
        ]

    def interest_by_pathway(self, window):
        counts = dict(
            ExpressionOfInterest.objects.filter(**window.filter_for("submitted_at"))
            .values("pathway__name")
            .annotate(count=Count("id"))
            .values_list("pathway__name", "count")
        )
        segments = [
            {"label": name, "value": counts.get(name, 0)}
            for name in Pathway.objects.order_by("name").values_list("name", flat=True)
        ]
        unknown = counts.get(None, 0)
        if unknown:
            segments.append({"label": "Not given", "value": unknown})
        return segments

    def community_activity(self, window):
        questions = self._weekly_map(Question.objects.all(), window)
        answers = self._weekly_map(Answer.objects.all(), window)
        return [
            {
                "label": key,
                "values": {"questions": questions.get(key, 0), "answers": answers.get(key, 0)},
            }
            for key in sorted(set(questions) | set(answers))
        ]

    def _weekly_map(self, queryset, window):
        rows = (
            self._bucketed(queryset, "created_at", window)
            .annotate(count=Count("id"))
            .order_by("bucket")
        )
        return {
            row["bucket"].date().isoformat(): row["count"] for row in rows if row["bucket"]
        }

    def answer_rate(self, window):
        """The share of questions asked in the window that got any answer."""
        row = Question.objects.filter(**window.filter_for("created_at")).aggregate(
            asked=Count("id"),
            answered=Count("id", filter=Q(answers__isnull=False), distinct=True),
        )
        asked = row["asked"] or 0
        answered = row["answered"] or 0
        return [
            {"label": "Answered", "value": answered},
            {"label": "Still waiting", "value": max(asked - answered, 0)},
        ]

    def active_topics(self, window):
        rows = (
            Question.objects.filter(**window.filter_for("created_at"))
            .values("topic")
            .annotate(count=Count("id"))
            .order_by("-count")[:6]
        )
        return [{"label": row["topic"], "value": row["count"]} for row in rows]

    def feedback_over_time(self, window):
        rows = (
            self._bucketed(Feedback.objects.all(), "created_at", window)
            .values("bucket", "category")
            .annotate(count=Count("id"))
            .order_by("bucket")
        )
        buckets = {}
        for row in rows:
            if not row["bucket"]:
                continue
            key = row["bucket"].date().isoformat()
            buckets.setdefault(key, {})[row["category"]] = row["count"]
        return [{"label": key, "values": values} for key, values in sorted(buckets.items())]

    def reports_activity(self, window):
        """Opened per bucket against resolved per bucket."""
        opened = self._weekly_map(Report.objects.all(), window)
        resolved = self._weekly_map(Report.objects.filter(resolved=True), window)
        return [
            {
                "label": key,
                "values": {"opened": opened.get(key, 0), "resolved": resolved.get(key, 0)},
            }
            for key in sorted(set(opened) | set(resolved))
        ]

    def languages(self):
        """
        Accounts by the language they chose.

        Not range-filtered: this is "what do people read the site in", which is
        a property of the accounts that exist, not of a window.
        """
        rows = (
            UserPreference.objects.values("language")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return [{"label": row["language"], "value": row["count"]} for row in rows]

    def provider_coverage(self):
        """
        Providers per region, and how many cannot be put on the map.

        Same test as `manage.py check_providers`: a provider at 0,0 is one
        whose postcode nothing could be found for, not one in the Atlantic.
        """
        from providers.models import Provider

        rows = (
            Provider.objects.values("region")
            .annotate(
                total=Count("id"),
                unplaced=Count("id", filter=Q(latitude=0, longitude=0)),
            )
            .order_by("region")
        )
        return [
            {"label": row["region"], "values": {"placed": row["total"] - row["unplaced"], "unplaced": row["unplaced"]}}
            for row in rows
        ]
