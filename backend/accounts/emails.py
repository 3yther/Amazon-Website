"""Sends the password reset email.

There's no email account for the prototype yet, so EMAIL_BACKEND in
settings.py prints the email to the server console. For production, point
EMAIL_BACKEND at Amazon SES.
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
