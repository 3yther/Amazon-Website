from django.urls import path

from .views import (
    ChangePasswordView,
    CsrfTokenView,
    DeactivateAccountView,
    FeedbackCreateView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
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
    path("password-reset/", PasswordResetRequestView.as_view(), name="accounts-password-reset"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="accounts-password-reset-confirm",
    ),
    path("deactivate-account/", DeactivateAccountView.as_view(), name="accounts-deactivate-account"),
    path("feedback/", FeedbackCreateView.as_view(), name="accounts-feedback"),
]
