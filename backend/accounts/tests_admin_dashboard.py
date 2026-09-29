"""
The Admin Portal dashboard: the CSV exports and the audit log.

The two things worth testing hardest here are the ones that fail silently.
A CSV that opens as mojibake or runs a formula still downloads fine, and an
audit log with a gap in it still returns 200.
"""
import datetime

from django.contrib.auth.models import User
from django.test import RequestFactory, TestCase

from .audit import record
from .csv_export import csv_filename, escape_cell, stream_csv
from .models import AdminAuditLog, Profile

PASSWORD = "harbour-lantern-47"


def make_user(username, user_type="student", **extra):
    user = User.objects.create_user(username, password=PASSWORD, **extra)
    Profile.objects.create(user=user, user_type=user_type)
    return user


def body_of(response):
    return b"".join(response.streaming_content).decode("utf-8-sig")


def raw_body_of(response):
    return b"".join(response.streaming_content)


class EscapeCellTests(TestCase):
    """
    A spreadsheet runs a cell starting with = + - @ as a formula. Our rows are
    written by the public, so a username can be a formula unless we stop it.
    """

    def test_every_formula_character_is_escaped(self):
        for leader in ["=", "+", "-", "@", "\t", "\r"]:
            with self.subTest(leader=leader):
                self.assertEqual(escape_cell(f"{leader}CMD"), f"'{leader}CMD")

    def test_the_hyperlink_attack_is_escaped(self):
        nasty = '=HYPERLINK("http://evil.example","click me")'

        self.assertEqual(escape_cell(nasty), f"'{nasty}")

    def test_ordinary_text_is_left_alone(self):
        self.assertEqual(escape_cell("ada"), "ada")
        self.assertEqual(escape_cell("Zoë"), "Zoë")

    def test_numbers_stay_numbers(self):
        """Quoting these would leave every count as text Excel will not sum."""
        self.assertEqual(escape_cell(7), 7)
        self.assertEqual(escape_cell(1.5), 1.5)

    def test_booleans_read_as_words(self):
        self.assertEqual(escape_cell(True), "yes")
        self.assertEqual(escape_cell(False), "no")

    def test_dates_are_iso(self):
        self.assertEqual(escape_cell(datetime.date(2026, 9, 29)), "2026-09-29")

    def test_none_is_blank_not_the_word_none(self):
        self.assertEqual(escape_cell(None), "")


class StreamCsvTests(TestCase):
    def test_it_starts_with_the_bom_so_excel_reads_utf8(self):
        response = stream_csv("people", ["Username"], [["Zoë"]])

        self.assertTrue(raw_body_of(response).startswith(b"\xef\xbb\xbf"))

    def test_non_latin_text_survives_the_round_trip(self):
        response = stream_csv("people", ["Username"], [["ادا"], ["আদা"]])

        body = body_of(response)
        self.assertIn("ادا", body)
        self.assertIn("আদা", body)

    def test_a_formula_in_a_row_is_escaped_on_the_way_out(self):
        response = stream_csv("people", ["Username"], [["=1+1"]])

        self.assertIn("'=1+1", body_of(response))

    def test_the_header_row_comes_first(self):
        response = stream_csv("people", ["Username", "Joined"], [["ada", "2026-09-29"]])

        self.assertEqual(body_of(response).splitlines()[0], "Username,Joined")

    def test_it_streams_rather_than_building_the_whole_file(self):
        self.assertTrue(hasattr(stream_csv("people", ["A"], [["b"]]), "streaming_content"))

    def test_the_filename_says_what_and_when(self):
        self.assertEqual(
            csv_filename("people", datetime.date(2026, 9, 29)), "tsmile-people-2026-09-29.csv"
        )

    def test_the_response_offers_it_as_a_download(self):
        response = stream_csv("people", ["A"], [])

        self.assertIn("attachment;", response["Content-Disposition"])
        self.assertIn("tsmile-people-", response["Content-Disposition"])


class AuditRecordTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def request_from(self, user):
        request = self.factory.post("/")
        request.user = user
        return request

    def test_it_records_who_did_what_to_whom(self):
        staff = make_user("staffer", "amazon_staff")
        target = make_user("ada")

        record(
            self.request_from(staff),
            AdminAuditLog.Action.ACCOUNT_REMOVED,
            target=target,
            target_label=target.username,
        )

        entry = AdminAuditLog.objects.get()
        self.assertEqual(entry.actor, staff)
        self.assertEqual(entry.actor_username, "staffer")
        self.assertEqual(entry.action, AdminAuditLog.Action.ACCOUNT_REMOVED)
        self.assertEqual(entry.target_type, "User")
        self.assertEqual(entry.target_id, str(target.pk))
        self.assertEqual(entry.target_label, "ada")

    def test_the_actor_username_outlives_the_actor(self):
        """
        actor goes NULL when that staff account is removed later. "Somebody
        deleted this" is a worse record than "staffer deleted this", so the
        name is copied in at the time.
        """
        staff = make_user("staffer", "amazon_staff")
        record(self.request_from(staff), AdminAuditLog.Action.POST_DELETED, target_label="a post")

        staff.delete()

        entry = AdminAuditLog.objects.get()
        self.assertIsNone(entry.actor)
        self.assertEqual(entry.actor_username, "staffer")

    def test_removing_the_target_leaves_the_entry_standing(self):
        """The whole point: the row it describes is usually gone afterwards."""
        staff = make_user("staffer", "amazon_staff")
        target = make_user("ada")
        record(
            self.request_from(staff),
            AdminAuditLog.Action.ACCOUNT_REMOVED,
            target=target,
            target_label="ada",
        )

        target.delete()

        self.assertEqual(AdminAuditLog.objects.count(), 1)
        self.assertEqual(AdminAuditLog.objects.get().target_label, "ada")

    def test_it_keeps_the_detail_it_is_given(self):
        staff = make_user("staffer", "amazon_staff")

        record(
            self.request_from(staff),
            AdminAuditLog.Action.ROLE_CHANGED,
            detail={"from": "student", "to": "teacher"},
        )

        self.assertEqual(AdminAuditLog.objects.get().detail, {"from": "student", "to": "teacher"})

    def test_a_failure_to_record_never_breaks_the_action(self):
        """
        A full disk should not turn a completed deletion into a 500 after the
        row has already gone. Recording fails quietly and logs.
        """
        staff = make_user("staffer", "amazon_staff")
        request = self.request_from(staff)

        with self.assertLogs("accounts.audit", level="ERROR"):
            # A detail JSONField cannot serialise: the insert fails, record does not.
            entry = record(request, AdminAuditLog.Action.POST_DELETED, detail={"ids": {1, 2}})

        self.assertIsNone(entry)

    def test_newest_first(self):
        staff = make_user("staffer", "amazon_staff")
        record(self.request_from(staff), AdminAuditLog.Action.POST_DELETED, target_label="first")
        record(self.request_from(staff), AdminAuditLog.Action.POST_DELETED, target_label="second")

        self.assertEqual(
            [entry.target_label for entry in AdminAuditLog.objects.all()], ["second", "first"]
        )
