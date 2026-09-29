"""
The Admin Portal dashboard: the CSV exports and the audit log.

The two things worth testing hardest here are the ones that fail silently.
A CSV that opens as mojibake or runs a formula still downloads fine, and an
audit log with a gap in it still returns 200.
"""
import datetime

from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import RequestFactory, TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from community.models import Answer, Question
from providers.models import Provider

from .audit import record
from .csv_export import csv_filename, escape_cell, stream_csv
from .models import AdminAuditLog, Profile, UserPreference

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


DASHBOARD_URL = "/api/accounts/admin-portal/dashboard/"
CHARTS_URL = "/api/accounts/admin-portal/dashboard/charts/"
PIN = "4821"


class DashboardPermissionTests(APITestCase):
    """
    Same two gates as every other portal endpoint, tested the same way: a
    correct PIN on a student account must get nothing, and staff who have not
    entered the PIN must also get nothing.
    """

    def setUp(self):
        cache.clear()

    def sign_in(self, user_type="amazon_staff"):
        make_user("someone", user_type)
        self.client.login(username="someone", password=PASSWORD)

    def test_anonymous_gets_nothing(self):
        for url in (DASHBOARD_URL, CHARTS_URL):
            with self.subTest(url=url):
                self.assertIn(self.client.get(url).status_code, (401, 403))

    def test_a_student_gets_nothing(self):
        self.sign_in("student")

        for url in (DASHBOARD_URL, CHARTS_URL):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 403)

    @override_settings(ADMIN_PORTAL_PIN=PIN)
    def test_staff_who_have_not_entered_the_pin_get_nothing(self):
        self.sign_in()

        for url in (DASHBOARD_URL, CHARTS_URL):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 403)

    @override_settings(ADMIN_PORTAL_PIN=PIN)
    def test_staff_who_have_get_in(self):
        self.sign_in()
        self.client.post("/api/accounts/admin-portal/unlock/", {"pin": PIN}, format="json")

        for url in (DASHBOARD_URL, CHARTS_URL):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)


@override_settings(ADMIN_PORTAL_PIN=PIN)
class DashboardNumbersTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff = make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post("/api/accounts/admin-portal/unlock/", {"pin": PIN}, format="json")

    def kpi(self, key, **params):
        response = self.client.get(DASHBOARD_URL, params)
        self.assertEqual(response.status_code, 200)
        return next(card for card in response.data["kpis"] if card["key"] == key)

    def join_at(self, username, days_ago):
        user = make_user(username)
        User.objects.filter(pk=user.pk).update(
            date_joined=timezone.now() - timedelta(days=days_ago)
        )
        return user

    def test_every_promised_card_is_there(self):
        response = self.client.get(DASHBOARD_URL)

        keys = {card["key"] for card in response.data["kpis"]}
        self.assertEqual(
            keys,
            {
                "accounts",
                "signups",
                "active",
                "interest",
                "questions",
                "answers",
                "unanswered",
                "feedback",
                "open_reports",
                "time_to_first_answer",
            },
        )

    def test_signups_counts_only_the_window(self):
        self.join_at("recent", days_ago=3)
        self.join_at("old", days_ago=200)

        # staffer joined just now, so the last 7 days holds it and "recent".
        self.assertEqual(self.kpi("signups", range="7d")["value"], 2)

    def test_it_compares_against_the_period_before(self):
        self.join_at("thisweek", days_ago=2)
        self.join_at("lastweek1", days_ago=9)
        self.join_at("lastweek2", days_ago=10)

        card = self.kpi("signups", range="7d")

        self.assertEqual(card["value"], 2)  # thisweek + staffer
        self.assertEqual(card["previous"], 2)
        self.assertEqual(card["change"], 0)
        self.assertEqual(card["percent"], 0.0)

    def test_an_empty_previous_period_gives_no_percentage(self):
        """
        Four sign-ups after a month of none is not an infinite rise. The API
        sends null and the page says "new" rather than dividing by zero.
        """
        self.join_at("newcomer", days_ago=1)

        card = self.kpi("signups", range="7d")

        self.assertEqual(card["previous"], 0)
        self.assertIsNone(card["percent"])

    def test_all_time_has_nothing_to_compare_against(self):
        card = self.kpi("signups", range="all")

        self.assertIsNone(card["previous"])
        self.assertIsNone(card["change"])
        self.assertIsNone(card["percent"])

    def test_accounts_is_cumulative_not_the_window(self):
        """"Total accounts" means how many exist, not how many arrived."""
        self.join_at("old", days_ago=300)

        self.assertEqual(self.kpi("accounts", range="7d")["value"], 2)

    def test_unanswered_counts_questions_with_nothing_under_them(self):
        asker = make_user("asker")
        Question.objects.create(author=asker, title="one", body="b")
        answered = Question.objects.create(author=asker, title="two", body="b")
        Answer.objects.create(author=asker, question=answered, body="here")

        self.assertEqual(self.kpi("unanswered", range="30d")["value"], 1)

    def test_time_to_first_answer_is_in_hours(self):
        asker = make_user("asker")
        question = Question.objects.create(author=asker, title="one", body="b")
        answer = Answer.objects.create(author=asker, question=question, body="here")
        Answer.objects.filter(pk=answer.pk).update(
            created_at=question.created_at + timedelta(hours=3)
        )

        card = self.kpi("time_to_first_answer", range="30d")

        self.assertEqual(card["value"], 3.0)
        self.assertEqual(card["unit"], "hours")
        self.assertTrue(card["lower_is_better"])

    def test_a_bad_range_falls_back_rather_than_erroring(self):
        """These come off a URL people edit by hand and share."""
        for bad in ["nonsense", "", "7dd"]:
            with self.subTest(bad=bad):
                response = self.client.get(DASHBOARD_URL, {"range": bad})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["range"]["preset"], "30d")

    def test_a_custom_range_the_wrong_way_round_is_turned_around(self):
        response = self.client.get(
            DASHBOARD_URL, {"range": "custom", "from": "2026-09-29", "to": "2026-09-01"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["range"]["from"], "2026-09-01")
        self.assertEqual(response.data["range"]["to"], "2026-09-29")

    def test_it_does_not_grow_a_query_per_row(self):
        """
        The guard against this turning into N+1.

        The pinned number is allowed to change when a card is added or a query
        is merged. What must never change is the SHAPE: the second half of
        this test is the part that matters, because a count that stays put
        between 10 rows and 60 is one that does not depend on how much data
        the site has.
        """
        for index in range(10):
            self.join_at(f"person{index}", days_ago=index % 28)

        with self.assertNumQueries(25):
            self.client.get(DASHBOARD_URL, {"range": "30d"})

        for index in range(50):
            self.join_at(f"more{index}", days_ago=index % 28)

        with self.assertNumQueries(25):
            self.client.get(DASHBOARD_URL, {"range": "30d"})

    def test_the_charts_do_not_grow_a_query_per_row_either(self):
        asker = make_user("asker")
        for index in range(30):
            question = Question.objects.create(author=asker, title=f"q{index}", body="b")
            Answer.objects.create(author=asker, question=question, body="a")

        with self.assertNumQueries(19):
            self.client.get(CHARTS_URL, {"range": "30d"})


@override_settings(ADMIN_PORTAL_PIN=PIN)
class DashboardChartsTests(APITestCase):
    def setUp(self):
        cache.clear()
        make_user("staffer", "amazon_staff")
        self.client.login(username="staffer", password=PASSWORD)
        self.client.post("/api/accounts/admin-portal/unlock/", {"pin": PIN}, format="json")

    def test_every_promised_series_is_there(self):
        response = self.client.get(CHARTS_URL)

        self.assertEqual(response.status_code, 200)
        for series in [
            "signups_over_time",
            "users_by_type",
            "interest_by_pathway",
            "community_activity",
            "answer_rate",
            "active_topics",
            "feedback_over_time",
            "reports_activity",
            "languages",
            "provider_coverage",
        ]:
            with self.subTest(series=series):
                self.assertIn(series, response.data)

    def test_answer_rate_splits_answered_from_waiting(self):
        asker = make_user("asker")
        answered = Question.objects.create(author=asker, title="one", body="b")
        Answer.objects.create(author=asker, question=answered, body="here")
        Question.objects.create(author=asker, title="two", body="b")

        rows = {row["label"]: row["value"] for row in self.client.get(CHARTS_URL).data["answer_rate"]}

        self.assertEqual(rows["Answered"], 1)
        self.assertEqual(rows["Still waiting"], 1)

    def test_provider_coverage_counts_the_unplaced_like_check_providers_does(self):
        Provider.objects.create(
            name="Placed College",
            postcode="M1 1AA",
            region=Provider._meta.get_field("region").choices[0][0],
            provider_type=Provider._meta.get_field("provider_type").choices[0][0],
            latitude=53.4,
            longitude=-2.2,
        )
        Provider.objects.create(
            name="Unplaced College",
            postcode="XX1 1XX",
            region=Provider._meta.get_field("region").choices[0][0],
            provider_type=Provider._meta.get_field("provider_type").choices[0][0],
            latitude=0,
            longitude=0,
        )

        rows = self.client.get(CHARTS_URL).data["provider_coverage"]
        totals = {"placed": 0, "unplaced": 0}
        for row in rows:
            totals["placed"] += row["values"]["placed"]
            totals["unplaced"] += row["values"]["unplaced"]

        self.assertEqual(totals, {"placed": 1, "unplaced": 1})

    def test_languages_counts_accounts_by_what_they_read_in(self):
        UserPreference.objects.update_or_create(
            user=make_user("polish"), defaults={"language": "pl"}
        )

        rows = {row["label"]: row["value"] for row in self.client.get(CHARTS_URL).data["languages"]}

        self.assertEqual(rows.get("pl"), 1)
