"""
One way to send a CSV, shared by every export in the Admin Portal.

Three things here are easy to get wrong separately in seven places, which is
why they live in one:

STREAMED, NOT BUILT. Exports honour the current filters and send every matching
row, not the page on screen. A year of sign-ups built into a string first would
hold the whole export in memory before a byte reached anybody; StreamingHttpResponse
with a generator hands rows out as the database produces them.

EXCEL AND THE BOM. Excel on Windows reads a CSV as the local 8-bit code page
unless the file opens with a UTF-8 byte order mark. Without it "Zoë" and every
name in Arabic, Bengali, Gujarati, Punjabi or Urdu arrive as mojibake, which on
this site is most of the interesting rows. The BOM is three bytes and costs
nothing anywhere else.

FORMULA INJECTION. A spreadsheet treats a cell starting with = + - @ (or a tab
or carriage return) as a formula, so a username of
`=HYPERLINK("http://evil.example","click")` becomes a live link in the
spreadsheet a staff member opens, and other formulas can reach the filesystem
or the network. Our data is written by the public, so every text cell is
escaped with a leading apostrophe, which Excel and LibreOffice both strip on
display. See `escape_cell`.
"""
import csv
import datetime

from django.http import StreamingHttpResponse
from django.utils import timezone

# Characters a spreadsheet reads as "this cell is a formula, not text".
FORMULA_LEADERS = ("=", "+", "-", "@", "\t", "\r")


class _Echo:
    """A file-like object whose write() returns the line instead of storing it.

    csv.writer insists on writing to something; this hands each formatted row
    straight back to the generator so nothing accumulates.
    """

    def write(self, value):
        return value


def escape_cell(value):
    """
    One cell, ready for a spreadsheet.

    Text is escaped: anything starting with a formula character gets a leading
    apostrophe, so it is shown as typed rather than run. Dates become ISO, so
    they sort and parse the same everywhere regardless of locale.

    Numbers, booleans and dates are NOT escaped: we produce those ourselves
    from database columns, they can never carry a formula, and quoting them
    would leave every count in the file as text that Excel will not sum.
    """
    if value is None:
        return ""

    if isinstance(value, bool):
        return "yes" if value else "no"

    if isinstance(value, datetime.datetime):
        # Local time, so a staff member reading it recognises the timestamps.
        return timezone.localtime(value).isoformat(timespec="seconds")

    if isinstance(value, datetime.date):
        return value.isoformat()

    if isinstance(value, (int, float)):
        return value

    text = str(value)
    return f"'{text}" if text.startswith(FORMULA_LEADERS) else text


def csv_filename(name, today=None):
    """`tsmile-people-2026-09-29.csv`. Sorts by name then date in a folder."""
    day = today or timezone.localdate()
    return f"tsmile-{name}-{day.isoformat()}.csv"


def stream_csv(name, header, rows):
    """
    A streamed CSV response.

    `header` is the stable English column names, which stay put even when the
    interface is in another language: these files get opened in a spreadsheet
    and pasted into other tools, and a column called "Nombre de usuario" one
    week and "Username" the next breaks whatever reads them.

    `rows` is any iterable of row iterables, ideally a generator over a
    queryset iterator so nothing is held in memory.
    """
    writer = csv.writer(_Echo())

    def lines():
        # The BOM goes first, before the header row. See the module docstring.
        yield "﻿"
        yield writer.writerow(header)
        for row in rows:
            yield writer.writerow([escape_cell(cell) for cell in row])

    response = StreamingHttpResponse(lines(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{csv_filename(name)}"'
    return response
