from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APITestCase

from content.models import Pathway

from .distance import haversine_miles
from .models import Provider
from .postcodes import PostcodeServiceUnavailable, looks_like_a_postcode, normalise

# Where the tests search from: Amazon's London office postcode area, to the
# same six decimal places postcodes.io gives.
LONDON = (51.515419, -0.141099)


def stub_lookup(point=LONDON):
    """
    Stand in for the one postcodes.io call a search makes.

    Every endpoint test patches this: the tests must not depend on somebody
    else's API being up, and we are testing our search, not their lookup.
    """
    return patch("providers.views.lookup", return_value=point)


class HaversineTests(TestCase):
    """
    Checked against known great-circle distances. The tolerances are wide
    enough for the sphere the formula assumes, and tight enough to catch a
    swapped argument or degrees left unconverted.
    """

    def test_same_point_is_zero(self):
        self.assertEqual(haversine_miles(51.5, -0.1, 51.5, -0.1), 0)

    def test_london_to_edinburgh(self):
        # King's Cross to Edinburgh Waverley, about 332 miles.
        miles = haversine_miles(51.5320, -0.1233, 55.9522, -3.1892)
        self.assertAlmostEqual(miles, 332, delta=3)

    def test_london_to_new_york(self):
        # A long one, to catch a formula that only works over short distances.
        miles = haversine_miles(51.5074, -0.1278, 40.7128, -74.0060)
        self.assertAlmostEqual(miles, 3461, delta=10)

    def test_one_degree_of_latitude_is_about_69_miles(self):
        self.assertAlmostEqual(haversine_miles(51.0, -0.1, 52.0, -0.1), 69.1, delta=0.2)

    def test_order_does_not_matter(self):
        there = haversine_miles(51.5, -0.1, 53.5, -2.2)
        back = haversine_miles(53.5, -2.2, 51.5, -0.1)
        self.assertAlmostEqual(there, back, places=9)

    def test_accepts_the_decimals_the_model_stores(self):
        provider = Provider(latitude="51.500000", longitude="-0.100000")
        miles = haversine_miles(51.5, -0.1, provider.latitude, provider.longitude)
        self.assertAlmostEqual(miles, 0, places=6)


class PostcodeHelperTests(TestCase):
    def test_normalise_strips_spaces_and_upper_cases(self):
        self.assertEqual(normalise(" sw1a 1aa "), "SW1A1AA")

    def test_recognises_the_shape_of_a_postcode(self):
        for postcode in ["SW1A 1AA", "n14 6bs", "M1 1AE", "B911SB"]:
            self.assertTrue(looks_like_a_postcode(postcode), postcode)

    def test_rejects_anything_that_is_not_one(self):
        for text in ["", "hello", "12345", "../../etc/passwd", "SW1A 1AA extra"]:
            self.assertFalse(looks_like_a_postcode(text), text)


class ProviderModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.provider = Provider.objects.create(
            name="Barnet and Southgate College",
            address="High Street, Southgate, London",
            postcode="N14 6BS",
            latitude="51.630410",
            longitude="-0.129501",
            website_url="https://www.barnetsouthgate.ac.uk",
        )
        cls.provider.pathways.add(cls.digital)

    def test_string_is_the_name(self):
        self.assertEqual(str(self.provider), "Barnet and Southgate College")

    def test_a_provider_offers_many_pathways_and_a_pathway_has_many_providers(self):
        business = Pathway.objects.create(
            name="Business", slug="business", summary="s", description="d"
        )
        self.provider.pathways.add(business)

        self.assertEqual(self.provider.pathways.count(), 2)
        self.assertEqual(list(self.digital.providers.all()), [self.provider])

    def test_geocoded_leaves_out_providers_still_at_zero(self):
        Provider.objects.create(
            name="Not looked up yet", address="a", postcode="M1 1AE",
            latitude="0.000000", longitude="0.000000",
        )
        self.assertEqual([p.name for p in Provider.objects.geocoded()], [self.provider.name])


class ProviderSearchTests(APITestCase):
    """The endpoint the T-Level Near You page calls."""

    URL = "/api/providers/search/"

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.engineering = Pathway.objects.create(
            name="Engineering", slug="engineering", summary="s", description="d"
        )

        # Distances from LONDON: Croydon about 10 miles, Southgate about 8,
        # Exeter about 157. Leeds is only there to be filtered out.
        cls.southgate = cls.make("Southgate College", "N14 6BS", "51.630410", "-0.129501")
        cls.croydon = cls.make("Croydon College", "CR9 1DX", "51.373414", "-0.095181")
        cls.exeter = cls.make("Exeter College", "EX4 4JS", "50.728212", "-3.538406")

        cls.southgate.pathways.add(cls.digital, cls.engineering)
        cls.croydon.pathways.add(cls.digital)
        cls.exeter.pathways.add(cls.engineering)

    @classmethod
    def make(cls, name, postcode, latitude, longitude):
        return Provider.objects.create(
            name=name, address=f"{name}, {postcode}", postcode=postcode,
            latitude=latitude, longitude=longitude,
            website_url=f"https://example.com/{postcode.replace(' ', '').lower()}",
        )

    def names(self, response):
        return [provider["name"] for provider in response.data["results"]]

    def test_missing_postcode_is_a_400_naming_the_field(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(list(response.data), ["postcode"])

    def test_unknown_postcode_is_a_400_not_a_500(self):
        with stub_lookup(point=None):
            response = self.client.get(self.URL, {"postcode": "ZZ99 9ZZ"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("ZZ99 9ZZ", str(response.data["postcode"][0]))

    def test_unknown_pathway_is_a_400(self):
        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU", "pathway": "nope"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["pathway"], ['Unknown pathway "nope".'])

    def test_a_radius_that_is_not_a_positive_number_is_a_400(self):
        for radius in ["0", "-5", "miles", "99999"]:
            with self.subTest(radius=radius), stub_lookup():
                response = self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": radius})
            self.assertEqual(response.status_code, 400, radius)
            self.assertEqual(list(response.data), ["radius"], radius)

    def test_every_bad_value_is_reported_at_once(self):
        response = self.client.get(self.URL, {"pathway": "nope", "radius": "-1"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"postcode", "pathway", "radius"})

    def test_a_search_is_public_and_sorted_nearest_first(self):
        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "30"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.names(response), ["Southgate College", "Croydon College"])
        distances = [provider["distance_miles"] for provider in response.data["results"]]
        self.assertEqual(distances, sorted(distances))

    def test_a_provider_outside_the_radius_is_left_out(self):
        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "9"})

        # Southgate is about 8 miles away, Croydon about 10, Exeter far beyond.
        self.assertEqual(self.names(response), ["Southgate College"])
        self.assertEqual(response.data["count"], 1)

    def test_the_default_radius_is_fifteen_miles(self):
        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU"})

        self.assertEqual(response.data["radius_miles"], 15)
        self.assertEqual(sorted(self.names(response)), ["Croydon College", "Southgate College"])

    def test_filtering_by_pathway(self):
        with stub_lookup():
            response = self.client.get(
                self.URL, {"postcode": "W1D 3QU", "radius": "30", "pathway": "engineering"}
            )

        self.assertEqual(self.names(response), ["Southgate College"])

    def test_a_result_carries_everything_the_page_shows(self):
        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "9"})

        provider = response.data["results"][0]
        self.assertEqual(
            set(provider),
            {"id", "name", "address", "postcode", "distance_miles", "website_url", "pathways"},
        )
        self.assertEqual(
            provider["pathways"],
            [{"name": "Digital", "slug": "digital"}, {"name": "Engineering", "slug": "engineering"}],
        )
        # Rounded to one decimal place, so the page never prints 8.043321 miles.
        self.assertEqual(provider["distance_miles"], round(provider["distance_miles"], 1))

    def test_a_provider_that_was_never_geocoded_is_left_out(self):
        self.make("Not looked up yet", "W1D 3QU", "0.000000", "0.000000")

        with stub_lookup():
            response = self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "200"})

        self.assertNotIn("Not looked up yet", self.names(response))

    def test_nothing_nearby_is_an_empty_list_not_an_error(self):
        with stub_lookup(point=(58.0, -4.0)):  # the Scottish Highlands
            response = self.client.get(self.URL, {"postcode": "IV27 4HP"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_the_lookup_service_being_down_is_a_503_not_a_400(self):
        """A visitor's postcode is not at fault, so do not tell them it is."""
        with patch("providers.views.lookup", side_effect=PostcodeServiceUnavailable):
            response = self.client.get(self.URL, {"postcode": "W1D 3QU"})

        self.assertEqual(response.status_code, 503)

    def test_only_one_outside_call_is_made_however_many_providers_there_are(self):
        with stub_lookup() as lookup_call:
            self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "200"})

        self.assertEqual(lookup_call.call_count, 1)


class SeedProvidersTests(APITestCase):
    """The providers.json fixture loaded on every deploy."""

    fixtures = ["pathways", "providers"]

    def test_every_provider_is_placed_on_the_map_and_offers_a_pathway(self):
        providers = Provider.objects.all()
        self.assertGreaterEqual(providers.count(), 10)
        for provider in providers:
            self.assertTrue(looks_like_a_postcode(provider.postcode), provider.name)
            self.assertNotEqual((provider.latitude, provider.longitude), (0, 0), provider.name)
            self.assertTrue(provider.website_url.startswith("https://"), provider.name)
            self.assertTrue(provider.pathways.exists(), provider.name)

    def test_every_pathway_is_offered_somewhere(self):
        for pathway in Pathway.objects.all():
            self.assertTrue(pathway.providers.exists(), pathway.slug)

    def test_a_london_search_finds_the_london_colleges(self):
        with stub_lookup():
            response = self.client.get("/api/providers/search/", {"postcode": "W1D 3QU"})

        names = [provider["name"] for provider in response.data["results"]]
        self.assertIn("Barnet and Southgate College", names)
        self.assertNotIn("Exeter College", names)


class GeocodeProvidersCommandTests(TestCase):
    """
    The command that places providers on the map, with postcodes.io stubbed.
    Its whole point is that it runs on deploy, so it has to be safe to repeat.
    """

    def setUp(self):
        self.unplaced = Provider.objects.create(
            name="Not looked up yet", address="a", postcode="n14 6bs",
            latitude="0.000000", longitude="0.000000",
        )
        self.placed = Provider.objects.create(
            name="Already placed", address="b", postcode="CR9 1DX",
            latitude="51.373414", longitude="-0.095181",
        )

    def run_command(self, lookups, **options):
        with patch("providers.management.commands.geocode_providers.lookup_many") as call:
            call.side_effect = lookups if callable(lookups) else lambda _: lookups
            call_command("geocode_providers", **options)
        return call

    def test_it_fills_in_a_provider_that_had_no_position(self):
        self.run_command({"N146BS": (51.630410, -0.129501)})

        self.unplaced.refresh_from_db()
        self.assertAlmostEqual(float(self.unplaced.latitude), 51.630410, places=6)
        self.assertAlmostEqual(float(self.unplaced.longitude), -0.129501, places=6)

    def test_it_leaves_providers_that_already_have_one_alone(self):
        call = self.run_command({"N146BS": (51.630410, -0.129501)})

        self.assertEqual(sorted(call.call_args[0][0]), ["n14 6bs"])
        self.placed.refresh_from_db()
        self.assertAlmostEqual(float(self.placed.latitude), 51.373414, places=6)

    def test_running_it_again_calls_nobody(self):
        """Idempotent: the second run has nothing left to do."""
        self.run_command({"N146BS": (51.630410, -0.129501)})

        with patch("providers.management.commands.geocode_providers.lookup_many") as call:
            call_command("geocode_providers")
        call.assert_not_called()

    def test_refresh_looks_every_provider_up_again(self):
        call = self.run_command(
            {"N146BS": (51.630410, -0.129501), "CR91DX": (51.373414, -0.095181)}, refresh=True
        )

        self.assertEqual(sorted(call.call_args[0][0]), ["CR9 1DX", "n14 6bs"])

    def test_a_postcode_nobody_can_find_is_left_alone_and_reported(self):
        output = StringIO()
        with patch("providers.management.commands.geocode_providers.lookup_many") as call:
            call.return_value = {"N146BS": None}
            call_command("geocode_providers", stdout=output)

        self.unplaced.refresh_from_db()
        self.assertEqual(float(self.unplaced.latitude), 0)
        self.assertIn("not found", output.getvalue())

    def test_the_service_being_down_does_not_stop_a_deploy(self):
        errors = StringIO()
        with patch("providers.management.commands.geocode_providers.lookup_many") as call:
            call.side_effect = PostcodeServiceUnavailable("postcodes.io could not be reached.")
            call_command("geocode_providers", stderr=errors)

        self.assertIn("run this again later", errors.getvalue())
        self.unplaced.refresh_from_db()
        self.assertEqual(float(self.unplaced.latitude), 0)


class SeededSearchEndToEndTests(APITestCase):
    """
    The search, from the shipped fixture to a non-empty answer, with nothing
    mocked but the visitor's own postcode lookup.

    Written after the live site answered every search with an empty list for
    days. The existing tests all passed throughout, because they build their
    own providers: none of them ever asked "does the data we actually ship
    produce a result?", so the one thing that was wrong was the one thing
    nothing looked at.

    These load providers.json exactly as the deploy does, and measure real
    distances between real coordinates. Only postcodes.io is stood in for,
    and only for the visitor's postcode, because a test suite must not depend
    on somebody else's API being up.
    """

    fixtures = ["pathways", "providers"]

    # Soho, central London. Four of the seeded colleges are inside 15 miles.
    LONDON = (51.513, -0.134)

    def test_the_fixture_alone_is_enough_to_find_something(self):
        with patch("providers.views.lookup", return_value=self.LONDON):
            response = self.client.get("/api/providers/search/", {"postcode": "W1D 3QU"})

        self.assertEqual(response.status_code, 200)
        # The assertion that would have caught it: not "is the shape right"
        # but "did anything come back at all".
        self.assertGreater(response.data["count"], 0)
        self.assertGreater(len(response.data["results"]), 0)

    def test_the_distances_are_real_and_sorted(self):
        with patch("providers.views.lookup", return_value=self.LONDON):
            response = self.client.get(
                "/api/providers/search/", {"postcode": "W1D 3QU", "radius": "50"}
            )

        miles = [provider["distance_miles"] for provider in response.data["results"]]
        self.assertEqual(miles, sorted(miles))
        # Real numbers from the real formula, not zeroes or None.
        self.assertTrue(all(isinstance(m, float) for m in miles))
        self.assertTrue(all(0 <= m <= 50 for m in miles), miles)
        # Somewhere in London should have a college within a few miles.
        self.assertLess(miles[0], 10, miles[:3])

    def test_every_seeded_provider_can_be_found_from_somewhere(self):
        """
        A provider left at 0, 0 is silently dropped from every search. This
        walks the whole fixture and searches from each one's own position, so
        a row that cannot be found fails by name rather than by absence.
        """
        for provider in Provider.objects.all():
            with self.subTest(provider=provider.name):
                self.assertNotEqual(
                    (provider.latitude, provider.longitude),
                    (0, 0),
                    f"{provider.name} has no position, so no search can return it",
                )
                origin = (float(provider.latitude), float(provider.longitude))
                with patch("providers.views.lookup", return_value=origin):
                    response = self.client.get(
                        "/api/providers/search/", {"postcode": provider.postcode, "radius": "5"}
                    )
                names = [item["name"] for item in response.data["results"]]
                self.assertIn(provider.name, names)

    def test_a_search_from_far_away_still_reaches_them(self):
        """Guards the radius comparison: 200 miles from London reaches most of England."""
        with patch("providers.views.lookup", return_value=self.LONDON):
            response = self.client.get(
                "/api/providers/search/", {"postcode": "W1D 3QU", "radius": "200"}
            )

        self.assertGreater(response.data["count"], 8, response.data["count"])


class UngeocodedProvidersTests(APITestCase):
    """
    The failure mode this whole batch is about: rows in the table that no
    search can return. It has to be loud somewhere, because to a visitor it
    looks exactly like "no colleges near you".
    """

    def setUp(self):
        self.provider = Provider.objects.create(
            name="Loaded but never placed", address="a", postcode="N14 6BS",
            latitude="0.000000", longitude="0.000000",
        )

    def test_the_search_still_answers_rather_than_erroring(self):
        with patch("providers.views.lookup", return_value=(51.513, -0.134)):
            response = self.client.get("/api/providers/search/", {"postcode": "W1D 3QU"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)

    def test_but_it_says_so_in_the_log(self):
        with patch("providers.views.lookup", return_value=(51.513, -0.134)):
            with self.assertLogs("providers.views", level="ERROR") as logged:
                self.client.get("/api/providers/search/", {"postcode": "W1D 3QU"})

        self.assertIn("geocode_providers", "".join(logged.output))

    def test_an_empty_table_says_something_different(self):
        Provider.objects.all().delete()

        with patch("providers.views.lookup", return_value=(51.513, -0.134)):
            with self.assertLogs("providers.views", level="ERROR") as logged:
                self.client.get("/api/providers/search/", {"postcode": "W1D 3QU"})

        self.assertIn("loaddata providers", "".join(logged.output))

    def test_a_genuine_miss_is_not_reported_as_a_fault(self):
        """Nothing within the radius is an answer, not a broken deploy."""
        self.provider.latitude, self.provider.longitude = "51.630410", "-0.129501"
        self.provider.save()

        with patch("providers.views.lookup", return_value=(58.0, -4.0)):  # the Highlands
            with self.assertNoLogs("providers.views", level="ERROR"):
                response = self.client.get("/api/providers/search/", {"postcode": "IV27 4HP"})

        self.assertEqual(response.data["count"], 0)


class CheckProvidersCommandTests(TestCase):
    """The health check that a deploy can fail on."""

    def run_check(self, **options):
        out, err = StringIO(), StringIO()
        try:
            call_command("check_providers", stdout=out, stderr=err, **options)
            return 0, out.getvalue(), err.getvalue()
        except SystemExit as exit_code:
            return exit_code.code, out.getvalue(), err.getvalue()

    def test_it_passes_when_every_provider_can_be_found(self):
        Provider.objects.create(
            name="Placed", address="a", postcode="N14 6BS",
            latitude="51.630410", longitude="-0.129501",
        )
        code, out, _ = self.run_check()

        self.assertEqual(code, 0)
        self.assertIn("1 provider(s) ready to search", out)

    def test_it_fails_on_an_empty_table(self):
        # The exact state the deployed site was in: migrations applied, no
        # providers, every search answering "none found".
        code, _, err = self.run_check()

        self.assertEqual(code, 1)
        self.assertIn("No providers at all", err)
        self.assertIn("loaddata providers", err)

    def test_it_fails_when_a_provider_has_no_position(self):
        Provider.objects.create(
            name="Placed", address="a", postcode="N14 6BS",
            latitude="51.630410", longitude="-0.129501",
        )
        Provider.objects.create(
            name="Not placed", address="b", postcode="CR9 1DX",
            latitude="0.000000", longitude="0.000000",
        )
        code, _, err = self.run_check()

        self.assertEqual(code, 1)
        self.assertIn("1 of 2", err)
        self.assertIn("Not placed", err)
        self.assertIn("geocode_providers", err)

    def test_allow_empty_is_for_a_fresh_database(self):
        code, _, err = self.run_check(allow_empty=True)

        self.assertEqual(code, 0)
        self.assertIn("No providers at all", err)


class ResultsAreNotCappedTests(APITestCase):
    """
    Every match inside the radius comes back, however many there are.

    The report behind these was "the search only ever shows about five".
    It was not a cap: the endpoint is a plain APIView, which has no
    pagination to inherit, and the project's page size is 20 rather than 5
    anyway. It was that the fixture held fifteen colleges spread across the
    whole of England, so at the widest radius the page offers nobody could
    ever see more than four.

    These pin both halves down: nothing truncates, and the data we ship is
    dense enough to prove it.
    """

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        # Twelve, spread along a line north of the search point so every one
        # is inside 25 miles. More than any page size in the project.
        for index in range(12):
            provider = Provider.objects.create(
                name=f"College {index}",
                address="a",
                postcode="N14 6BS",
                latitude=str(round(51.5 + index * 0.02, 6)),
                longitude="-0.130000",
            )
            provider.pathways.add(cls.digital)

    def search(self, **params):
        with stub_lookup(point=(51.5, -0.13)):
            return self.client.get("/api/providers/search/", {"postcode": "W1D 3QU", **params})

    def test_all_twelve_come_back_not_the_first_five(self):
        response = self.search(radius="25")

        self.assertEqual(response.data["count"], 12)
        self.assertEqual(len(response.data["results"]), 12)

    def test_count_always_matches_what_was_actually_sent(self):
        """
        A cap usually shows up as these two disagreeing: a count of everything
        matched, next to one page of results.
        """
        for radius in ["5", "10", "25", "50"]:
            with self.subTest(radius=radius):
                response = self.search(radius=radius)
                self.assertEqual(response.data["count"], len(response.data["results"]))

    def test_the_answer_is_not_a_paginated_one(self):
        """
        Locks the shape down. If this view is ever rewritten as a generic list
        view it will pick up the project-wide PageNumberPagination and start
        truncating silently, and NearYou.jsx reads results straight out of the
        body with nothing to follow a next link with.
        """
        response = self.search(radius="25")

        self.assertEqual(
            set(response.data), {"postcode", "radius_miles", "count", "results"}
        )
        self.assertNotIn("next", response.data)
        self.assertNotIn("previous", response.data)

    def test_filtering_by_pathway_still_returns_all_the_matches(self):
        response = self.search(radius="25", pathway="digital")

        self.assertEqual(len(response.data["results"]), 12)


class SeedCoverageTests(APITestCase):
    """
    The shipped fixture has to be dense enough to be worth searching.

    With the fifteen it started with, six of a spread of ordinary UK postcodes
    returned NOTHING at the default fifteen miles, and no postcode anywhere
    could return more than four at the widest radius the page offers. The
    search worked perfectly and still looked broken.
    """

    fixtures = ["pathways", "providers"]

    # Ordinary places somebody testing this would type, and the city centre
    # coordinates postcodes.io gives for them.
    CITIES = {
        "London": (51.513, -0.134),
        "Birmingham": (52.4778, -1.8990),
        "Manchester": (53.4794, -2.2453),
        "Leeds": (53.7965, -1.5478),
        "Bristol": (51.4536, -2.5977),
        "Liverpool": (53.4045, -2.9819),
        "Southampton": (50.9020, -1.4040),
        "Newcastle": (54.9738, -1.6131),
    }

    def count_near(self, point, radius):
        with stub_lookup(point=point):
            response = self.client.get(
                "/api/providers/search/", {"postcode": "W1D 3QU", "radius": str(radius)}
            )
        return response.data["count"]

    def test_no_major_city_comes_back_empty_handed(self):
        for city, point in self.CITIES.items():
            with self.subTest(city=city):
                self.assertGreater(self.count_near(point, 15), 0)

    def test_a_city_search_returns_a_list_worth_reading(self):
        """More than five, which is the number that prompted this."""
        for city in ["London", "Birmingham", "Manchester"]:
            with self.subTest(city=city):
                self.assertGreater(self.count_near(self.CITIES[city], 15), 5)

    def test_the_widest_radius_reaches_a_lot(self):
        self.assertGreater(self.count_near(self.CITIES["London"], 50), 15)
