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
    """Fakes the postcodes.io call so the tests don't need the internet."""
    return patch("providers.views.lookup", return_value=point)


class HaversineTests(TestCase):
    """Checked against known distances."""

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
            {
                "id",
                "name",
                "address",
                "postcode",
                "region",
                "provider_type",
                "foundation_year",
                "distance_miles",
                "website_url",
                "pathways",
                "pathways_confirmed",
            },
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

    # The postcodes in the official register that no geocoder can resolve, so
    # the providers holding them cannot be searched for. Written down as a
    # number rather than waved through: if a change unplaces more than this,
    # something has gone wrong and these tests should say so.
    MAX_UNPLACED = 25

    def test_every_provider_is_described_well_enough_to_list(self):
        providers = Provider.objects.all()
        self.assertGreaterEqual(providers.count(), 300)
        for provider in providers:
            with self.subTest(provider=provider.name):
                self.assertTrue(looks_like_a_postcode(provider.postcode), provider.postcode)
                self.assertTrue(provider.name)
                self.assertTrue(provider.region)
                self.assertTrue(provider.provider_type)

    def test_almost_every_provider_is_placed_on_the_map(self):
        """
        A provider at 0, 0 is left out of every search, so this counts them.

        It is a budget rather than a ban because a handful of the register's
        postcodes do not exist anywhere: some are typos, some are invalid on
        their face. Those cannot be fixed from here, but a jump in the number
        means something else broke.
        """
        unplaced = Provider.objects.filter(latitude=0, longitude=0)
        self.assertLessEqual(
            unplaced.count(),
            self.MAX_UNPLACED,
            sorted(f"{p.postcode} {p.name}" for p in unplaced),
        )
        self.assertGreaterEqual(Provider.objects.geocoded().count(), 300)

    def test_a_website_we_hold_is_a_real_one(self):
        """
        Most of the register carries no website, which is fine: the card
        leaves the link out. The ones we do hold have to work.
        """
        with_sites = Provider.objects.exclude(website_url="")
        self.assertGreater(with_sites.count(), 0)
        for provider in with_sites:
            self.assertTrue(provider.website_url.startswith("https://"), provider.name)

    def test_a_confirmed_provider_is_one_somebody_actually_checked(self):
        """
        pathways_confirmed is the whole basis of the two-list answer, so it
        must not drift into meaning nothing. Every confirmed provider here
        offers at least one pathway, and the unconfirmed ones offer none.
        """
        confirmed = Provider.objects.filter(pathways_confirmed=True)
        self.assertGreater(confirmed.count(), 30)
        for provider in confirmed:
            self.assertTrue(provider.pathways.exists(), provider.name)

        for provider in Provider.objects.filter(pathways_confirmed=False):
            self.assertFalse(provider.pathways.exists(), provider.name)

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
    """Searches using the real providers.json fixture, with only the visitor's
    postcode lookup faked. Added after the live site returned no results for
    days because the fixture wasn't loaded.
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
        """Searches from every placed provider's own position, so one that can't
        be found fails by name.

        The ones left at 0, 0 are counted by
        SeedProvidersTests.test_almost_every_provider_is_placed_on_the_map: they
        are out of every search by design, and the point here is that the rest
        are reachable.
        """
        for provider in Provider.objects.geocoded():
            with self.subTest(provider=provider.name):
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
    """Providers that no search can return should be obvious."""

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
    """Every match inside the radius comes back, not just the first few."""

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
        """The search isn't paginated, because NearYou.jsx reads all the results at once."""
        response = self.search(radius="25")

        self.assertEqual(
            set(response.data),
            {
                "postcode",
                "radius_miles",
                "pathway",
                "count",
                "results",
                "unconfirmed_count",
                "unconfirmed",
            },
        )
        self.assertNotIn("next", response.data)
        self.assertNotIn("previous", response.data)

    def test_filtering_by_pathway_still_returns_all_the_matches(self):
        response = self.search(radius="25", pathway="digital")

        self.assertEqual(len(response.data["results"]), 12)


class SeedCoverageTests(APITestCase):
    """The fixture should have enough providers that normal postcodes find some."""

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


class RegisterFieldsTests(TestCase):
    """What the official register carries, beyond a name and a postcode."""

    def make(self, **fields):
        return Provider.objects.create(
            name=fields.pop("name", "A College"),
            address="a",
            postcode="N14 6BS",
            latitude="51.630410",
            longitude="-0.129501",
            **fields,
        )

    def test_a_provider_remembers_its_region_and_type(self):
        provider = self.make(region="London", provider_type="Sixth Form College")

        provider.refresh_from_db()
        self.assertEqual(provider.region, "London")
        self.assertEqual(provider.provider_type, "Sixth Form College")

    def test_the_foundation_year_is_off_unless_the_register_says_otherwise(self):
        self.assertFalse(self.make().foundation_year)
        self.assertTrue(self.make(name="B College", foundation_year=True).foundation_year)

    def test_subjects_are_unconfirmed_until_somebody_says_so(self):
        """
        The default has to be False. A provider added without anyone checking
        its subjects must not be presented as one that offers none of them.
        """
        self.assertFalse(self.make().pathways_confirmed)


class UnconfirmedSubjectsSearchTests(APITestCase):
    """
    The two lists a filtered search answers with.

    The official register says only THAT a provider runs T-Levels, so for most
    of the list nobody knows which subjects. A search filtered by pathway
    therefore cannot honestly give one list: it separates the providers we
    have checked from the ones we have not, and the page says which is which.

    Everything here sits north of the search point along one line, so the
    distances are predictable and the ordering is easy to assert.
    """

    URL = "/api/providers/search/"
    ORIGIN = (51.500000, -0.130000)

    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.media = Pathway.objects.create(
            name="Media", slug="media", summary="s", description="d"
        )

        # Checked, and it does offer Digital. Nearest of the three.
        cls.offers_digital = cls.make("Offers Digital", 51.51, confirmed=True)
        cls.offers_digital.pathways.add(cls.digital)

        # Checked, and it does not. Must appear in neither list.
        cls.offers_media = cls.make("Offers Media only", 51.53, confirmed=True)
        cls.offers_media.pathways.add(cls.media)

        # Never checked. Belongs in "unconfirmed", not in the matches.
        cls.unchecked = cls.make("Not checked yet", 51.55, confirmed=False)
        cls.further_unchecked = cls.make("Also not checked", 51.60, confirmed=False)

    @classmethod
    def make(cls, name, latitude, confirmed):
        return Provider.objects.create(
            name=name,
            address="a",
            postcode="N14 6BS",
            region="London",
            provider_type="Sixth Form College",
            latitude=str(latitude),
            longitude="-0.130000",
            pathways_confirmed=confirmed,
        )

    def search(self, **params):
        with stub_lookup(point=self.ORIGIN):
            return self.client.get(self.URL, {"postcode": "W1D 3QU", "radius": "50", **params})

    def names(self, response, key="results"):
        return [provider["name"] for provider in response.data[key]]

    def test_an_unfiltered_search_puts_everything_in_one_list(self):
        """Nothing is claimed about subjects, so there is nothing to be unsure about."""
        response = self.search()

        self.assertEqual(len(self.names(response)), 4)
        self.assertEqual(response.data["unconfirmed"], [])
        self.assertEqual(response.data["unconfirmed_count"], 0)

    def test_a_filtered_search_matches_only_the_providers_we_checked(self):
        response = self.search(pathway="digital")

        self.assertEqual(self.names(response), ["Offers Digital"])
        self.assertEqual(response.data["count"], 1)

    def test_a_provider_we_checked_that_does_not_offer_it_is_in_neither_list(self):
        """The whole point of confirming: this one is a real "no", not a maybe."""
        response = self.search(pathway="digital")

        self.assertNotIn("Offers Media only", self.names(response))
        self.assertNotIn("Offers Media only", self.names(response, "unconfirmed"))

    def test_the_ones_nobody_checked_come_back_separately(self):
        response = self.search(pathway="digital")

        self.assertEqual(
            self.names(response, "unconfirmed"), ["Not checked yet", "Also not checked"]
        )
        self.assertEqual(response.data["unconfirmed_count"], 2)

    def test_the_unconfirmed_list_is_sorted_nearest_first_too(self):
        response = self.search(pathway="digital")

        miles = [provider["distance_miles"] for provider in response.data["unconfirmed"]]
        self.assertEqual(miles, sorted(miles))

    def test_the_radius_bounds_the_unconfirmed_list_as_well(self):
        """Otherwise a narrow search would quietly pull in the whole country."""
        response = self.search(pathway="digital", radius="5")

        self.assertEqual(self.names(response, "unconfirmed"), ["Not checked yet"])

    def test_the_answer_says_which_pathway_it_was_about(self):
        """The page needs it to word "no Digital providers within 15 miles"."""
        self.assertEqual(self.search(pathway="digital").data["pathway"], "digital")
        self.assertEqual(self.search().data["pathway"], "")

    def test_an_unknown_pathway_is_still_a_400_and_never_a_half_answer(self):
        response = self.search(pathway="underwater-basket-weaving")

        self.assertEqual(response.status_code, 400)
        self.assertIn("pathway", response.data)
        self.assertNotIn("unconfirmed", response.data)

    def test_a_confirmed_row_carries_the_flag_to_the_page(self):
        response = self.search(pathway="digital")

        self.assertTrue(response.data["results"][0]["pathways_confirmed"])
        self.assertFalse(response.data["unconfirmed"][0]["pathways_confirmed"])


class RetiredPostcodeTests(TestCase):
    """
    Placing a provider whose postcode Royal Mail has withdrawn.

    The register carries a fair number of these, and they are real places: a
    college that moved or was rebuilt keeps its old postcode in the
    spreadsheet. Leaving them out of the search would be throwing away
    colleges we know where to find, so the command falls back to the retired
    record and says that it did.
    """

    def setUp(self):
        self.provider = Provider.objects.create(
            name="Rebuilt College",
            address="a",
            postcode="EX4 3EQ",
            latitude="0.000000",
            longitude="0.000000",
        )

    def run_command(self, *args):
        out = StringIO()
        call_command("geocode_providers", *args, stdout=out, stderr=StringIO())
        return out.getvalue()

    def test_a_retired_postcode_still_places_the_provider(self):
        with patch("providers.management.commands.geocode_providers.lookup_many", return_value={}):
            with patch(
                "providers.management.commands.geocode_providers.lookup_terminated",
                return_value=(50.722925, -3.532821),
            ):
                output = self.run_command()

        self.provider.refresh_from_db()
        self.assertAlmostEqual(float(self.provider.latitude), 50.722925, places=5)
        self.assertIn("1 provider(s) placed on the map", output)

    def test_it_says_the_postcode_was_a_retired_one(self):
        """
        Silently using a withdrawn postcode would hide a stale address. The
        provider is searchable either way; somebody should still go and look.
        """
        with patch("providers.management.commands.geocode_providers.lookup_many", return_value={}):
            with patch(
                "providers.management.commands.geocode_providers.lookup_terminated",
                return_value=(50.722925, -3.532821),
            ):
                output = self.run_command()

        self.assertIn("RETIRED", output)
        self.assertIn("Rebuilt College", output)

    def test_strict_leaves_it_unplaced_instead(self):
        with patch("providers.management.commands.geocode_providers.lookup_many", return_value={}):
            with patch(
                "providers.management.commands.geocode_providers.lookup_terminated"
            ) as terminated:
                output = self.run_command("--strict")

        terminated.assert_not_called()
        self.provider.refresh_from_db()
        self.assertEqual((self.provider.latitude, self.provider.longitude), (0, 0))
        self.assertIn("not found", output)

    def test_a_postcode_that_is_retired_nowhere_either_is_reported(self):
        with patch("providers.management.commands.geocode_providers.lookup_many", return_value={}):
            with patch(
                "providers.management.commands.geocode_providers.lookup_terminated",
                return_value=None,
            ):
                output = self.run_command()

        self.assertIn("1 postcode(s) not found", output)
        self.assertIn("EX4 3EQ", output)

    def test_one_retired_lookup_serves_every_provider_sharing_the_postcode(self):
        Provider.objects.create(
            name="Second Campus",
            address="a",
            postcode="ex4 3eq",
            latitude="0.000000",
            longitude="0.000000",
        )

        with patch("providers.management.commands.geocode_providers.lookup_many", return_value={}):
            with patch(
                "providers.management.commands.geocode_providers.lookup_terminated",
                return_value=(50.722925, -3.532821),
            ) as terminated:
                self.run_command()

        self.assertEqual(terminated.call_count, 1)


class CheckProvidersToleranceTests(TestCase):
    """
    The deploy check, once the list is the official 360 rather than 71 by hand.

    A few of the register's postcodes exist nowhere, so failing on the first
    unplaced provider would fail every deploy forever, and a check that always
    fails is a check everybody learns to ignore. It now fails on "the search
    is broken", not on "the data is imperfect".
    """

    def make(self, name, placed):
        return Provider.objects.create(
            name=name,
            address="a",
            postcode="N14 6BS",
            latitude="51.630410" if placed else "0.000000",
            longitude="-0.129501" if placed else "0.000000",
        )

    def run_command(self, *args):
        out, err = StringIO(), StringIO()
        call_command("check_providers", *args, stdout=out, stderr=err)
        return out.getvalue() + err.getvalue()

    def test_a_few_bad_postcodes_in_a_big_list_do_not_fail_the_deploy(self):
        for index in range(20):
            self.make(f"Placed {index}", placed=True)
        self.make("Bad postcode", placed=False)

        output = self.run_command()

        self.assertIn("20 provider(s) ready to search", output)
        self.assertIn("Bad postcode", output)

    def test_but_a_wholesale_failure_to_place_anything_still_stops_it(self):
        for index in range(10):
            self.make(f"Unplaced {index}", placed=False)
        self.make("The only placed one", placed=True)

        with self.assertRaises(SystemExit):
            self.run_command()

    def test_the_bar_can_be_set_by_hand(self):
        for index in range(20):
            self.make(f"Placed {index}", placed=True)
        self.make("Bad postcode", placed=False)

        with self.assertRaises(SystemExit):
            self.run_command("--max-unplaced", "0")

    def test_nothing_loaded_at_all_is_still_the_loud_failure(self):
        with self.assertRaises(SystemExit):
            self.run_command()
