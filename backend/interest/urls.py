from django.urls import path

from .views import ExpressionOfInterestCreateView

urlpatterns = [
    path("interest/", ExpressionOfInterestCreateView.as_view(), name="interest-create"),
]
