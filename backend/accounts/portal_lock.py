"""
The Admin Portal's screen-lock.

A 4-digit PIN asked for on top of already being signed in as Amazon staff. It
is NOT the site's access control: every endpoint behind it also checks
IsAmazonStaff, and would still refuse a non-staff account with a correct PIN.
What it buys is a quick re-lock for a staff laptop somebody walked away from,
which is why it expires on a timer rather than lasting as long as the session.

Kept apart from views.py because two things need it (the unlock view sets it,
the permission class reads it) and neither should own it.
"""
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

SESSION_KEY = "admin_portal_unlocked_at"


def unlock(request):
    """Mark this session as having entered the PIN, from now."""
    request.session[SESSION_KEY] = timezone.now().isoformat()


def lock(request):
    """Forget the PIN, e.g. when the portal is left or the timer runs out."""
    request.session.pop(SESSION_KEY, None)


def is_unlocked(request):
    """
    True when this session entered the PIN recently enough.

    Refreshes the clock on the way past, so somebody working in the portal is
    not thrown out mid-task; it is time since last use, not since unlocking.
    """
    stamp = request.session.get(SESSION_KEY)
    if not stamp:
        return False

    try:
        unlocked_at = timezone.datetime.fromisoformat(stamp)
    except (TypeError, ValueError):
        # A session from an older format, or tampered with. Ask again.
        lock(request)
        return False

    if timezone.now() - unlocked_at > timedelta(minutes=settings.ADMIN_PORTAL_UNLOCK_MINUTES):
        lock(request)
        return False

    unlock(request)
    return True


def pin_is_correct(given):
    """
    True when `given` matches the configured PIN.

    No PIN configured means nobody gets in. Failing closed matters more than
    convenience here: the alternative is an environment where the portal is
    wide open because somebody forgot an environment variable.
    """
    expected = settings.ADMIN_PORTAL_PIN
    if not expected:
        return False

    # Constant time, so the answer cannot be found a digit at a time.
    from django.utils.crypto import constant_time_compare

    return constant_time_compare(str(given), str(expected))
