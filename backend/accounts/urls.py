from django.urls import path

from .views import (
    ChangePasswordView,
    CsrfTokenView,
    DeactivateAccountView,
    FeedbackCreateView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    UserPreferenceView,
)

urlpatterns = [
    path("csrf/", CsrfTokenView.as_view(), name="accounts-csrf"),
    path("register/", RegisterView.as_view(), name="accounts-register"),
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),
    path("me/", MeView.as_view(), name="accounts-me"),
    path("user-preferences/", UserPreferenceView.as_view(), name="accounts-user-preferences"),
    path("change-password/", ChangePasswordView.as_view(), name="accounts-change-password"),
    path("deactivate-account/", DeactivateAccountView.as_view(), name="accounts-deactivate-account"),
    path("feedback/", FeedbackCreateView.as_view(), name="accounts-feedback"),
]
