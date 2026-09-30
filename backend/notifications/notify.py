"""Makes notifications, but only for people who have that kind switched on."""
from accounts.models import UserPreference

from .models import Notification

# Which UserPreference switch each kind of notification follows.
SETTING_FOR = {
    Notification.Kind.ANNOUNCEMENT: "notify_announcements",
    Notification.Kind.COMMUNITY: "notify_community",
    Notification.Kind.INTEREST: "notify_interest",
}


def wants(user, kind):
    """True unless the person has switched this kind off. On by default."""
    preferences = UserPreference.objects.filter(user=user).first()
    return preferences is None or getattr(preferences, SETTING_FOR[kind])


def notify(user, kind, event, text="", link=""):
    """Notify one person, if they want this kind. Returns the notification or None."""
    if user is None or not user.is_active or not wants(user, kind):
        return None
    return Notification.objects.create(user=user, kind=kind, event=event, text=text[:300], link=link)
