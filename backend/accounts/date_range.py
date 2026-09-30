"""
The date range every dashboard number is counted over.

One place, because the Overview, the data tabs and the CSV exports must all
mean the same thing by "last 30 days" or the export will not match the chart it
was taken from.

THE PREVIOUS PERIOD. Every KPI is shown against the period immediately before
it, of the same length: 30 days against the 30 days before those. That makes
"up 12%" mean something specific, and it is why the range carries four dates
rather than two.

DIVIDING BY ZERO. A site with no sign-ups last month and four this month has
not grown by infinity percent. When the previous period is empty there is no
percentage, and the API sends null rather than a number, so the page can say
"new" instead of printing nonsense.
"""
from datetime import timedelta

from django.utils import timezone

# What the filter bar offers. "all" has no start, "custom" reads from/to.
PRESETS = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12m": 365,
    "all": None,
    "custom": None,
}
DEFAULT_PRESET = "30d"


class DateRange:
    """A window, and the equally long window before it."""

    def __init__(self, start, end, preset=DEFAULT_PRESET):
        self.start = start  # None means "since the beginning"
        self.end = end
        self.preset = preset

        if start is None:
            # "All time" has no previous period to compare against, and
            # inventing one would make the first KPI card lie.
            self.previous_start = None
            self.previous_end = None
        else:
            length = end - start
            self.previous_end = start
            self.previous_start = start - length

    @property
    def has_previous(self):
        return self.previous_start is not None

    def filter_for(self, field):
        """`{"created_at__gte": ..., "created_at__lte": ...}` for this window."""
        if self.start is None:
            return {f"{field}__lte": self.end}
        return {f"{field}__gte": self.start, f"{field}__lte": self.end}

    def previous_filter_for(self, field):
        if not self.has_previous:
            return None
        # __lt on the upper bound, not __lte: the previous window ends exactly
        # where this one starts, and __lte would count that instant twice.
        return {f"{field}__gte": self.previous_start, f"{field}__lt": self.previous_end}

    def as_json(self):
        return {
            "preset": self.preset,
            "from": self.start.date().isoformat() if self.start else None,
            "to": self.end.date().isoformat(),
            "previous_from": self.previous_start.date().isoformat() if self.previous_start else None,
            "previous_to": self.previous_end.date().isoformat() if self.previous_end else None,
        }


def _parse_day(text, end_of_day=False):
    """A `YYYY-MM-DD` from the query string, or None if it is not one."""
    if not text:
        return None
    try:
        day = timezone.datetime.strptime(text.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return None

    moment = timezone.datetime.combine(
        day, timezone.datetime.max.time() if end_of_day else timezone.datetime.min.time()
    )
    return timezone.make_aware(moment) if timezone.is_naive(moment) else moment


def from_request(request):
    """
    The range this request is asking for.

    Anything unparseable falls back to the default rather than erroring: these
    values come off a URL people share and edit by hand, and a dashboard that
    500s on a typo in a bookmark is worse than one that shows the last 30 days.
    """
    params = request.query_params if hasattr(request, "query_params") else request.GET
    preset = (params.get("range") or "").strip() or DEFAULT_PRESET
    if preset not in PRESETS:
        preset = DEFAULT_PRESET

    now = timezone.now()

    if preset == "custom":
        start = _parse_day(params.get("from"))
        end = _parse_day(params.get("to"), end_of_day=True) or now
        if start is None:
            # A custom range with no usable start is just the default window.
            return DateRange(now - timedelta(days=PRESETS[DEFAULT_PRESET]), now, DEFAULT_PRESET)
        if start > end:
            start, end = end, start
        return DateRange(start, end, "custom")

    if preset == "all":
        return DateRange(None, now, "all")

    return DateRange(now - timedelta(days=PRESETS[preset]), now, preset)


def change_between(current, previous, has_previous=True):
    """
    How a number moved, as the API sends it.

    `percent` is None when there is nothing to compare against, either because
    the range is all-time or because the previous period was empty. The page
    shows "new" for that rather than a percentage.
    """
    if not has_previous or previous is None:
        return {"previous": None, "change": None, "percent": None}

    change = current - previous
    return {
        "previous": previous,
        "change": change,
        "percent": round(change / previous * 100, 1) if previous else None,
    }
