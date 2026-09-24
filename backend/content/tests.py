from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import ContentItem, Pathway


class ContentApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.digital = Pathway.objects.create(
            name="Digital", slug="digital", summary="s", description="d"
        )
        cls.business = Pathway.objects.create(
            name="Business", slug="business", summary="s", description="d"
        )
        ContentItem.objects.create(
            title="General guide", slug="general-guide", description="d",
            content_type="guide", access_level="free", audience="all",
        )
        ContentItem.objects.create(
            title="Digital prep pack", slug="digital-prep-pack", description="d",
            content_type="prep_pack", access_level="signup", audience="student",
            pathway=cls.digital, file="content/digital-prep-pack.pdf",
        )
        ContentItem.objects.create(
            title="Business class pack", slug="business-class-pack", description="d",
            content_type="class_pack", access_level="free", audience="teacher",
            pathway=cls.business,
        )

    def slugs(self, response):
        return {item["slug"] for item in response.data["results"]}

    def test_pathways_list_is_public_and_unpaginated(self):
        response = self.client.get("/api/pathways/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([p["slug"] for p in response.data], ["business", "digital"])

    def test_pathway_detail_by_slug(self):
        response = self.client.get("/api/pathways/digital/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Digital")

    def test_content_list_is_public(self):
        response = self.client.get("/api/content/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

    def test_filter_by_pathway_includes_general_items(self):
        response = self.client.get("/api/content/", {"pathway": "digital"})
        self.assertEqual(self.slugs(response), {"general-guide", "digital-prep-pack"})

    def test_filter_by_audience_includes_everyone_items(self):
        response = self.client.get("/api/content/", {"audience": "teacher"})
        self.assertEqual(self.slugs(response), {"general-guide", "business-class-pack"})

    def test_filter_by_access_level(self):
        response = self.client.get("/api/content/", {"access_level": "signup"})
        self.assertEqual(self.slugs(response), {"digital-prep-pack"})

    def test_filters_combine(self):
        response = self.client.get(
            "/api/content/", {"pathway": "business", "audience": "teacher", "access_level": "free"}
        )
        self.assertEqual(self.slugs(response), {"general-guide", "business-class-pack"})

    def test_invalid_filters_return_400(self):
        response = self.client.get(
            "/api/content/", {"pathway": "nope", "audience": "robots", "access_level": "vip"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"pathway", "audience", "access_level"})

    def test_signup_file_hidden_when_signed_out(self):
        response = self.client.get("/api/content/digital-prep-pack/")
        self.assertTrue(response.data["locked"])
        self.assertIsNone(response.data["file"])

    def test_signup_file_shown_when_signed_in(self):
        self.client.force_authenticate(User.objects.create_user("student1", password="x"))
        response = self.client.get("/api/content/digital-prep-pack/")
        self.assertFalse(response.data["locked"])
        self.assertTrue(response.data["file"].endswith("/media/content/digital-prep-pack.pdf"))


class ContentLinkTests(APITestCase):
    """Links to other sites follow the same sign-up rule as files."""

    @classmethod
    def setUpTestData(cls):
        ContentItem.objects.create(
            title="Free link", slug="free-link", description="d", content_type="guide",
            access_level="free", link="https://www.gov.uk/free",
        )
        ContentItem.objects.create(
            title="Sign-up link", slug="signup-link", description="d", content_type="guide",
            access_level="signup", link="https://www.gov.uk/signup",
        )

    def test_free_link_is_returned(self):
        response = self.client.get("/api/content/free-link/")
        self.assertEqual(response.data["link"], "https://www.gov.uk/free")

    def test_signup_link_hidden_until_signed_in(self):
        response = self.client.get("/api/content/signup-link/")
        self.assertTrue(response.data["locked"])
        self.assertIsNone(response.data["link"])

        self.client.force_authenticate(User.objects.create_user("student2", password="x"))
        response = self.client.get("/api/content/signup-link/")
        self.assertFalse(response.data["locked"])
        self.assertEqual(response.data["link"], "https://www.gov.uk/signup")


class StarterResourcesTests(APITestCase):
    """The resources.json fixture loaded on every deploy."""

    fixtures = ["pathways", "resources"]

    def test_every_item_is_free_with_an_https_link_and_no_file(self):
        items = ContentItem.objects.all()
        self.assertEqual(items.count(), 23)
        for item in items:
            self.assertEqual(item.access_level, "free", item.slug)
            self.assertTrue(item.link.startswith("https://"), item.slug)
            self.assertFalse(item.file, item.slug)

    def test_every_pathway_has_an_item(self):
        for pathway in Pathway.objects.all():
            self.assertTrue(pathway.content_items.exists(), pathway.slug)

    def test_digital_filter_returns_more_than_three(self):
        response = self.client.get("/api/content/", {"pathway": "digital"})
        self.assertGreater(response.data["count"], 3)
