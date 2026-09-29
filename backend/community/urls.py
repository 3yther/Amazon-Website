from django.urls import path

from .moderation_views import (
    PostDeleteView,
    PostListView,
    ReportActionView,
    ReportedCountsView,
    ReportListView,
)
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
    # The Admin Portal's Reported posts tab. Staff plus the PIN (see
    # accounts.permissions.IsAmazonStaffAndUnlocked).
    path("admin-portal/reports/", ReportListView.as_view(), name="admin-portal-reports"),
    path(
        "admin-portal/reports/counts/",
        ReportedCountsView.as_view(),
        name="admin-portal-report-counts",
    ),
    path("admin-portal/posts/", PostListView.as_view(), name="admin-portal-posts"),
    path(
        "admin-portal/posts/<str:kind>/<int:pk>/delete/",
        PostDeleteView.as_view(),
        name="admin-portal-post-delete",
    ),
    *[
        path(
            f"admin-portal/reports/<int:pk>/{action}/",
            ReportActionView.as_view(action=action),
            name=f"admin-portal-report-{action}",
        )
        for action in ("hide", "restore", "resolve", "delete")
    ],
]
