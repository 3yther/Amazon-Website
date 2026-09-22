from django.urls import path

from .views import CsrfTokenView, LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path("csrf/", CsrfTokenView.as_view(), name="accounts-csrf"),
    path("register/", RegisterView.as_view(), name="accounts-register"),
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),
    path("me/", MeView.as_view(), name="accounts-me"),
]
