from django.urls import path

from .admin_dashboard import DashboardChartsView, DashboardView
from .admin_portal import (
    FeedbackListView,
    LockView,
    OverviewView,
    PeopleView,
    RemoveAccountView,
    RevokeStaffView,
    StatusView,
    UnlockView,
)
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
    # The Admin Portal. Everything but unlock/lock/status is behind the PIN as
    # well as the staff check (see permissions.IsAmazonStaffAndUnlocked).
    path("admin-portal/unlock/", UnlockView.as_view(), name="admin-portal-unlock"),
    path("admin-portal/lock/", LockView.as_view(), name="admin-portal-lock"),
    path("admin-portal/status/", StatusView.as_view(), name="admin-portal-status"),
    path("admin-portal/overview/", OverviewView.as_view(), name="admin-portal-overview"),
    path("admin-portal/dashboard/", DashboardView.as_view(), name="admin-portal-dashboard"),
    path(
        "admin-portal/dashboard/charts/",
        DashboardChartsView.as_view(),
        name="admin-portal-dashboard-charts",
    ),
    path("admin-portal/people/", PeopleView.as_view(), name="admin-portal-people"),
    path(
        "admin-portal/people/<int:pk>/remove/",
        RemoveAccountView.as_view(),
        name="admin-portal-remove",
    ),
    path(
        "admin-portal/people/<int:pk>/revoke-staff/",
        RevokeStaffView.as_view(),
        name="admin-portal-revoke-staff",
    ),
    path("admin-portal/feedback/", FeedbackListView.as_view(), name="admin-portal-feedback"),
]
