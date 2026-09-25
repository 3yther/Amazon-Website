from rest_framework import serializers

from chatbot.serializers import sanitise
from content.models import Pathway

from .models import Answer, Question, Report, Topic
from .moderation import check_post


def author_summary(user):
    """
    How an author appears: a username and a role badge, nothing else. No real
    names, schools or photos, because most people here are under 18.
    """
    profile = getattr(user, "profile", None)
    if profile is not None:
        role = profile.user_type
    elif user.is_staff:
        role = "team"
    else:
        role = "member"
    return {"username": user.username, "role": role}


def moderate(*texts):
    """Stops a post the moderation check does not allow, with its reason."""
    reason = check_post(*texts)
    if reason:
        # A code the front end turns into a clear message in the poster's
        # own language (see i18n/messages, community.blocked).
        raise serializers.ValidationError({"moderation": reason})


class CountsMixin:
    """The counts the views add to each post (see with_counts in views.py).
    Falls back to 0 for a brand new post.
    """

    def get_answer_count(self, post):
        return getattr(post, "answer_count", 0)

    def get_helpful_count(self, post):
        return getattr(post, "helpful_count", 0)

    def get_has_accepted(self, post):
        return bool(getattr(post, "has_accepted", False))

    def get_found_helpful(self, post):
        return bool(getattr(post, "found_helpful", False))


class PathwayField(serializers.SlugRelatedField):
    def __init__(self, **kwargs):
        super().__init__(slug_field="slug", queryset=Pathway.objects.all(), **kwargs)

    def to_representation(self, pathway):
        return {"name": pathway.name, "slug": pathway.slug}


class AnswerSerializer(CountsMixin, serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    body = serializers.CharField(max_length=2000)
    helpful_count = serializers.SerializerMethodField()
    found_helpful = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = [
            "id",
            "body",
            "author",
            "created_at",
            "is_accepted",
            "helpful_count",
            "found_helpful",
            "is_mine",
            "hidden",
        ]
        read_only_fields = ["id", "author", "created_at", "is_accepted", "hidden"]

    def get_author(self, answer):
        return author_summary(answer.author)

    def get_is_mine(self, answer):
        user = self.context["request"].user
        return user.is_authenticated and answer.author_id == user.id

    def validate_body(self, value):
        value = sanitise(value)
        if len(value) < 2:
            raise serializers.ValidationError("Write an answer first.")
        return value

    def validate(self, attrs):
        moderate(attrs.get("body", ""))
        return attrs


class QuestionSerializer(CountsMixin, serializers.ModelSerializer):
    """
    A question, for the list and for asking one. The list shows a short
    excerpt; the detail view (QuestionDetailSerializer) adds the answers.
    """

    author = serializers.SerializerMethodField()
    pathway = PathwayField(required=False, allow_null=True)
    topic = serializers.ChoiceField(choices=Topic.choices, default=Topic.TLEVELS)
    excerpt = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    has_accepted = serializers.SerializerMethodField()
    found_helpful = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "body",
            "excerpt",
            "topic",
            "pathway",
            "author",
            "created_at",
            "answer_count",
            "helpful_count",
            "has_accepted",
            "found_helpful",
            "is_mine",
            "hidden",
        ]
        read_only_fields = ["id", "author", "created_at", "hidden"]
        # The title is the question; the body is optional detail. The list
        # sends an excerpt instead, so the full body is only in the detail.
        extra_kwargs = {
            "body": {"write_only": True, "required": False, "allow_blank": True, "max_length": 2000}
        }

    def get_author(self, question):
        return author_summary(question.author)

    def get_excerpt(self, question):
        body = question.body
        return body if len(body) <= 180 else f"{body[:177].rstrip()}..."

    def get_is_mine(self, question):
        user = self.context["request"].user
        return user.is_authenticated and question.author_id == user.id

    def validate_title(self, value):
        value = sanitise(value)
        if len(value) < 8:
            raise serializers.ValidationError("Make the question a little longer so people know what you mean.")
        return value

    def validate_body(self, value):
        return sanitise(value)

    def validate(self, attrs):
        moderate(attrs.get("title", ""), attrs.get("body", ""))
        return attrs


class QuestionDetailSerializer(QuestionSerializer):
    """One question in full, with its answers."""

    answers = serializers.SerializerMethodField()

    class Meta(QuestionSerializer.Meta):
        fields = [*QuestionSerializer.Meta.fields, "answers"]
        extra_kwargs = {}

    def get_answers(self, question):
        return AnswerSerializer(self.context["answers"], many=True, context=self.context).data


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["reason", "note"]

    def validate_note(self, value):
        return sanitise(value)
