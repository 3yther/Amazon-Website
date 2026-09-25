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

# CSRF: DRF only checks the CSRF token for signed-in users.
# So the front end gets a token from GET /api/accounts/csrf/ and sends it in
# an X-CSRFToken header on every POST, PATCH or DELETE. Django makes a new
# token on login, so it has to be fetched again after login or register.
# Register and login are checked too, to stop "login CSRF".


class CsrfCheckedMixin:
    """Check the CSRF token even when the visitor is not signed in yet."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        SessionAuthentication().enforce_csrf(request)


class SignedInMixin:
    """For signed-in users only. Signed-out requests get 401."""

    permission_classes = [IsAuthenticated]

    def get_authenticate_header(self, request):
        # Makes signed-out requests get 401 instead of 403.
        return "Session"


class CsrfTokenView(APIView):
    """GET /api/accounts/csrf/ sets the csrftoken cookie and returns {"csrf_token": "..."}."""

    permission_classes = [AllowAny]

    def get(self, request):
        # get_token also tells CsrfViewMiddleware to set the cookie on this response.
        return Response({"csrf_token": get_token(request)})


class RegisterView(CsrfCheckedMixin, generics.CreateAPIView):
    """POST /api/accounts/register/

    Body: username, password, password_confirm, user_type, pathway_interest (optional).
    Creates the account and signs in. Staff accounts are made in admin.
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
    """POST /api/accounts/login/

    Body: username, password. The error never says if the username exists.
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
    """POST /api/accounts/logout/ ends the session."""

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(SignedInMixin, generics.RetrieveUpdateAPIView):
    """GET /api/accounts/me/ returns the signed-in user, or 401 if signed out.
    PATCH /api/accounts/me/ updates first_name, last_name, email or phone.
    """

    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user


class UserPreferenceView(SignedInMixin, generics.RetrieveUpdateAPIView):
    """GET /api/accounts/user-preferences/ returns the user's settings (made with defaults if new).
    PATCH /api/accounts/user-preferences/ changes some of them.
    """

    serializer_class = UserPreferenceSerializer

    def get_object(self):
        preference, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return preference


class ChangePasswordView(SignedInMixin, APIView):
    """POST /api/accounts/change-password/

    Body: current_password, new_password, confirm_password.
    update_session_auth_hash keeps this session signed in afterwards.
    """

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        update_session_auth_hash(request, user)
        return Response({"success": True})


class PasswordResetRequestView(CsrfCheckedMixin, generics.GenericAPIView):
    """POST /api/accounts/password-reset/

    Body: username. Always gives the same message so nobody can check which
    usernames exist. Rate limited per IP.
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
    """POST /api/accounts/password-reset/confirm/

    Body: uid, token (from the email link), new_password, confirm_password.
    Signs the visitor in if it works.
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
    """POST /api/accounts/deactivate-account/

    Body: password. Deactivates the account and ends the session.
    """

    def post(self, request):
        serializer = DeactivateAccountSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logout(request)
        return Response({"success": True})


class FeedbackCreateView(generics.CreateAPIView):
    """POST /api/accounts/feedback/

    Body: category, message, email (optional). Anyone can send it, signed in or
    not. If signed in, it's linked to the account. Rate limited per IP.
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
