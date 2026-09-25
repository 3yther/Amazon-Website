from django.db.models import Count, Exists, OuterRef, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import REPORTS_TO_HIDE, Answer, Helpful, Question, Report, Topic
from .serializers import AnswerSerializer, QuestionDetailSerializer, QuestionSerializer, ReportSerializer

# Everything here: anyone can read, only signed-in people can post, answer,
# mark something helpful or report it. Posting is rate limited per person.


class SignedInForWrites:
    """
    Reading is open; writing needs an account. A signed-out write gets 401
    (not 403), so the front end knows to offer the login page.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_authenticate_header(self, request):
        return "Session"


class PostThrottle:
    """Throttle writes only (scope set per view), never reading."""

    def get_throttles(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return []
        throttle = ScopedRateThrottle()
        return [throttle]


def visible(queryset, user):
    """What this person may see: everything not hidden, plus their own posts."""
    if user.is_authenticated:
        return queryset.filter(Q(hidden=False) | Q(author=user))
    return queryset.filter(hidden=False)


def with_counts(questions, user):
    """Adds the numbers the list shows, in one query."""
    questions = questions.select_related("author__profile", "pathway").annotate(
        answer_count=Count("answers", filter=Q(answers__hidden=False), distinct=True),
        helpful_count=Count("helpful_marks", distinct=True),
        has_accepted=Exists(Answer.objects.filter(question=OuterRef("pk"), is_accepted=True, hidden=False)),
    )
    if user.is_authenticated:
        questions = questions.annotate(
            found_helpful=Exists(Helpful.objects.filter(question=OuterRef("pk"), user=user))
        )
    return questions


def answers_for(question, user):
    """A question's answers this person may see, accepted answer first."""
    answers = visible(question.answers.all(), user).select_related("author__profile").annotate(
        helpful_count=Count("helpful_marks", distinct=True)
    )
    if user.is_authenticated:
        answers = answers.annotate(found_helpful=Exists(Helpful.objects.filter(answer=OuterRef("pk"), user=user)))
    return answers.order_by("-is_accepted", "-helpful_count", "created_at")


class QuestionListView(SignedInForWrites, PostThrottle, generics.ListCreateAPIView):
    """
    GET  /api/community/questions/   the questions, newest first
         ?topic=<topic>              one topic (see models.Topic)
         ?pathway=<slug>             one pathway
         ?sort=new|helpful|unanswered
         ?q=<words>                  search titles and questions
    POST /api/community/questions/   ask one: title, body (optional), topic,
                                     pathway (a slug, optional). Checked by
                                     moderation.py before it is published.
    """

    serializer_class = QuestionSerializer
    throttle_scope = "community_ask"

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params
        questions = with_counts(visible(Question.objects.all(), user), user)

        topic = params.get("topic")
        if topic:
            if topic not in Topic.values:
                raise ValidationError({"topic": [f"Choose one of: {', '.join(Topic.values)}."]})
            questions = questions.filter(topic=topic)

        pathway = params.get("pathway")
        if pathway:
            questions = questions.filter(pathway__slug=pathway)

        search = params.get("q", "").strip()
        if search:
            for word in search.split()[:6]:
                questions = questions.filter(Q(title__icontains=word) | Q(body__icontains=word))

        sort = params.get("sort", "new")
        if sort == "helpful":
            return questions.order_by("-helpful_count", "-created_at")
        if sort == "unanswered":
            return questions.filter(answer_count=0).order_by("-created_at")
        return questions.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class QuestionDetailView(SignedInForWrites, generics.RetrieveDestroyAPIView):
    """
    GET    /api/community/questions/<id>/   one question with its answers
    DELETE /api/community/questions/<id>/   your own question, and its answers
    """

    serializer_class = QuestionDetailSerializer

    def get_queryset(self):
        user = self.request.user
        return with_counts(visible(Question.objects.all(), user), user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == "GET" and "pk" in self.kwargs:
            question = self.get_object()
            context["answers"] = answers_for(question, self.request.user)
        return context

    def retrieve(self, request, *args, **kwargs):
        question = self.get_object()
        return Response(self.get_serializer(question).data)

    def perform_destroy(self, question):
        if question.author_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own question.")
        question.delete()


class AnswerCreateView(PostThrottle, generics.CreateAPIView):
    """POST /api/community/questions/<id>/answers/   answer a question: body."""

    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = "community_answer"

    def get_authenticate_header(self, request):
        return "Session"

    def perform_create(self, serializer):
        question = get_object_or_404(visible(Question.objects.all(), self.request.user), pk=self.kwargs["pk"])
        if question.hidden:
            raise PermissionDenied("This question is waiting for a staff review.")
        serializer.save(author=self.request.user, question=question)


class AnswerDeleteView(generics.DestroyAPIView):
    """DELETE /api/community/answers/<id>/   your own answer."""

    permission_classes = [IsAuthenticated]

    def get_authenticate_header(self, request):
        return "Session"

    def get_queryset(self):
        return Answer.objects.filter(author=self.request.user)


class PostActionView(PostThrottle, APIView):
    """Something done to a question or an answer: which one is in the URL."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "community_action"
    kind = None  # "question" or "answer"

    def get_authenticate_header(self, request):
        return "Session"

    def get_post(self):
        model = Question if self.kind == "question" else Answer
        return get_object_or_404(visible(model.objects.all(), self.request.user), pk=self.kwargs["pk"])

    def target(self, post):
        return {self.kind: post}


class HelpfulView(PostActionView):
    """
    POST /api/community/questions/<id>/helpful/
    POST /api/community/answers/<id>/helpful/

    Marks the post helpful, or takes the mark back if it was already given.
    Nobody can mark their own. Returns { found_helpful, helpful_count }.
    """

    def post(self, request, pk):
        post = self.get_post()
        if post.author_id == request.user.id:
            raise ValidationError({"detail": "own_post"})

        mark = Helpful.objects.filter(user=request.user, **self.target(post)).first()
        if mark:
            mark.delete()
        else:
            Helpful.objects.create(user=request.user, **self.target(post))

        return Response(
            {"found_helpful": mark is None, "helpful_count": post.helpful_marks.count()}
        )


class AcceptView(PostActionView):
    """
    POST /api/community/answers/<id>/accept/

    The person who asked marks the answer that helped them, or unmarks it.
    One accepted answer per question. Returns { is_accepted }.
    """

    kind = "answer"

    def post(self, request, pk):
        answer = self.get_post()
        if answer.question.author_id != request.user.id:
            raise PermissionDenied("Only the person who asked can mark the answer that helped.")

        accept = not answer.is_accepted
        if accept:
            answer.question.answers.filter(is_accepted=True).update(is_accepted=False)
        answer.is_accepted = accept
        answer.save(update_fields=["is_accepted"])
        return Response({"is_accepted": accept})


class ReportView(PostActionView):
    """
    POST /api/community/questions/<id>/report/
    POST /api/community/answers/<id>/report/

    Body: reason (see Report.Reason), note (optional). Reporting twice counts
    once. Three people reporting a post hides it until staff review it; a
    report from staff hides it straight away. Returns 201 { reported: true }.
    """

    def post(self, request, pk):
        post = self.get_post()
        if post.author_id == request.user.id:
            raise ValidationError({"detail": "own_post"})

        serializer = ReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        Report.objects.get_or_create(reporter=request.user, **self.target(post), defaults=serializer.validated_data)

        open_reports = post.reports.filter(resolved=False).values("reporter").distinct().count()
        if not post.hidden and (request.user.is_staff or open_reports >= REPORTS_TO_HIDE):
            post.hide("reported")

        return Response({"reported": True}, status=status.HTTP_201_CREATED)
