from django.contrib.auth import login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
from rest_framework import generics, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import UserPreference
from .serializers import (
    AccountSerializer,
    ChangePasswordSerializer,
    CurrentUserSerializer,
    DeactivateAccountSerializer,
    FeedbackSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserPreferenceSerializer,
)

# CSRF with session auth, and why these views do what they do:
#
# DRF wraps every API view in csrf_exempt, so Django's CSRF middleware never
# checks them. SessionAuthentication checks the token instead, but only when the
# request comes from a signed-in user. Signed-out requests are not checked.
# That is why POST /api/interest/ works from React today without a token, and
# why it will fail with 403 "CSRF Failed" for a signed-in user until the front
# end sends one.
#
# Adding @method_decorator(csrf_exempt) would not help: DRF's check ignores that
# decorator. Switching the check off would leave logout, and every future
# signed-in POST, open to cross-site request forgery.
#
# So these endpoints use Django's standard token flow:
#   1. The front end calls GET /api/accounts/csrf/ on load. That sets the
#      csrftoken cookie and returns the token in the body.
#   2. Every POST, PUT, PATCH or DELETE sends it in an X-CSRFToken header.
#   3. Django issues a new token on login, so fetch it again after login or
#      register.
# Register and login are checked even though the visitor is signed out. That
# blocks "login CSRF", where a hostile site signs a visitor into another account.


class CsrfCheckedMixin:
    """Check the CSRF token even when the visitor is not signed in yet."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        SessionAuthentication().enforce_csrf(request)


class SignedInMixin:
    """For signed-in users only. Signed-out requests get 401."""

    permission_classes = [IsAuthenticated]

    def get_authenticate_header(self, request):
        # DRF only answers 401 when it can name an auth scheme in the
        # WWW-Authenticate header. Session auth has none, so without this a
        # signed-out request would get 403.
        return "Session"


class CsrfTokenView(APIView):
    """
    GET /api/accounts/csrf/

    Sets the csrftoken cookie and returns {"csrf_token": "..."}.
    Send the token back in an X-CSRFToken header on every POST.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        # get_token also tells CsrfViewMiddleware to set the cookie on this response.
        return Response({"csrf_token": get_token(request)})


class RegisterView(CsrfCheckedMixin, generics.CreateAPIView):
    """
    POST /api/accounts/register/

    Body: username, password, password_confirm,
    user_type (student | parent | teacher), pathway_interest (optional).
    Creates the account, signs the user in and returns 201 with id, username
    and user_type, or 400 with field errors. Staff accounts are made in admin.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(AccountSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(CsrfCheckedMixin, generics.GenericAPIView):
    """
    POST /api/accounts/login/

    Body: username, password.
    Starts a session and returns 200 with id, username and user_type, or 400
    with one generic error that never says whether the username exists.
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(AccountSerializer(user).data)


class LogoutView(SignedInMixin, APIView):
    """
    POST /api/accounts/logout/

    Ends the session and returns 204. Needs a signed-in session and a CSRF token.
    """

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(SignedInMixin, generics.RetrieveUpdateAPIView):
    """
    GET /api/accounts/me/

    Returns id, username, user_type, pathway_interest, first_name, last_name,
    email, phone, last_password_changed and preferences for the signed-in
    user, or 401 when signed out. The front end calls this on page load.

    PATCH /api/accounts/me/

    Body: any of first_name, last_name, email, phone. Partial update, so only
    fields present in the body are changed.
    """

    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user


class UserPreferenceView(SignedInMixin, generics.RetrieveUpdateAPIView):
    """
    GET /api/accounts/user-preferences/

    Returns the signed-in user's accessibility preferences, creating them
    with defaults on first request.

    PATCH /api/accounts/user-preferences/

    Partial update: only fields present in the body are changed. Each field
    is validated against the ranges and choices in models.py.
    """

    serializer_class = UserPreferenceSerializer

    def get_object(self):
        preference, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return preference


class ChangePasswordView(SignedInMixin, APIView):
    """
    POST /api/accounts/change-password/

    Body: current_password, new_password, confirm_password.
    Changing a password logs Django out of every other request carrying the
    old session hash, so update_session_auth_hash keeps this one signed in.
    Returns {"success": true}, or 400 with field errors.
    """

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        update_session_auth_hash(request, user)
        return Response({"success": True})


class PasswordResetRequestView(CsrfCheckedMixin, generics.GenericAPIView):
    """
    POST /api/accounts/password-reset/

    Body: username.
    Always returns 200 with the same generic message, whether or not that
    username exists or has an email on file - see PasswordResetRequestSerializer.
    Checked for CSRF even though the visitor is signed out, the same as
    RegisterView and LoginView above. Throttled per IP so this cannot be
    used to spam an inbox or discover usernames by timing.
    """

    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "detail": "If that account has an email on file, we've sent password "
                "reset instructions to it."
            }
        )


class PasswordResetConfirmView(CsrfCheckedMixin, generics.GenericAPIView):
    """
    POST /api/accounts/password-reset/confirm/

    Body: uid, token (both come from the link in the email), new_password,
    confirm_password. Returns {"success": true} and signs the visitor in
    (same as register and login), or 400 with field errors when the link is
    wrong, reused or expired, or the new password fails validation.
    """

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response({"success": True})


class DeactivateAccountView(SignedInMixin, APIView):
    """
    POST /api/accounts/deactivate-account/

    Body: password. Deactivates the account (so it can no longer sign in)
    and ends the session. Returns {"success": true}, or 400 with a wrong
    password.
    """

    def post(self, request):
        serializer = DeactivateAccountSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logout(request)
        return Response({"success": True})


class FeedbackCreateView(generics.CreateAPIView):
    """
    POST /api/accounts/feedback/

    Body: category, message, email (optional). Open to anyone, signed in or
    not: unlike the views above, this does not require a session, so it has
    no CSRF token to check either (see the module comment at the top of this
    file - the check only ever applies to signed-in requests). If the
    request is signed in, the account is linked automatically. Rate limited
    per IP (see DEFAULT_THROTTLE_RATES in settings) to keep the form from
    being spammed.

    Returns {"success": true}, or 400 with field errors.
    """

    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "feedback"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        serializer.save(user=user)
        return Response({"success": True}, status=status.HTTP_201_CREATED)
