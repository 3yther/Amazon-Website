from django.urls import path

from .views import ExpressionOfInterestCreateView, ExpressionOfInterestListView

urlpatterns = [
    path("interest/", ExpressionOfInterestCreateView.as_view(), name="interest-create"),
    # Staff-only read path, kept off the public create URL on purpose (see
    # the view's docstring).
    path(
        "interest/submissions/",
        ExpressionOfInterestListView.as_view(),
        name="interest-submissions",
    ),
]
