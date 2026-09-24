from django.urls import path

from .views import (
    AcceptView,
    AnswerCreateView,
    AnswerDeleteView,
    HelpfulView,
    QuestionDetailView,
    QuestionListView,
    ReportView,
)

urlpatterns = [
    path("questions/", QuestionListView.as_view(), name="community-questions"),
    path("questions/<int:pk>/", QuestionDetailView.as_view(), name="community-question"),
    path("questions/<int:pk>/answers/", AnswerCreateView.as_view(), name="community-answer-create"),
    path("questions/<int:pk>/helpful/", HelpfulView.as_view(kind="question"), name="community-question-helpful"),
    path("questions/<int:pk>/report/", ReportView.as_view(kind="question"), name="community-question-report"),
    path("answers/<int:pk>/", AnswerDeleteView.as_view(), name="community-answer"),
    path("answers/<int:pk>/helpful/", HelpfulView.as_view(kind="answer"), name="community-answer-helpful"),
    path("answers/<int:pk>/accept/", AcceptView.as_view(), name="community-answer-accept"),
    path("answers/<int:pk>/report/", ReportView.as_view(kind="answer"), name="community-answer-report"),
]
