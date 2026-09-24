from django.urls import path

from .views import ProviderSearchView

urlpatterns = [
    path("providers/search/", ProviderSearchView.as_view(), name="provider-search"),
]
