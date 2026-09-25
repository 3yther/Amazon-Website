"""
Sends the password reset email.

Kept separate from serializers.py so the token and link-building logic has
one home. See settings.py for EMAIL_BACKEND: no SMTP account exists for the
prototype, so this writes the message to the server console instead of a
real inbox. That is enough to demonstrate and test the flow end to end.
PRODUCTION: point EMAIL_BACKEND (and DEFAULT_FROM_EMAIL) at Amazon SES, as
noted as a stretch service in the Hosting and Data Architecture section of
the proposal; nothing here or in views.py needs to change to make that
switch.
"""
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_password_reset_email(user):
    """Build the one-time reset link for `user` and email it to them."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    send_mail(
        subject="Reset your T-SMILE password",
        message=(
            "We received a request to reset the password for your T-SMILE account.\n\n"
            f"Reset it here: {link}\n\n"
            "This link works once, and stops working after a few days. If you did not "
            "ask for this, you can ignore this email and your password will not change."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
