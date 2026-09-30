from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import Announcement, Notification


def send_announcement(announcement):
    """Put the announcement in the bell of everyone who has announcements on."""
    users = get_user_model().objects.filter(is_active=True).exclude(
        preferences__notify_announcements=False
    )
    Notification.objects.bulk_create(
        Notification(
            user=user,
            kind=Notification.Kind.ANNOUNCEMENT,
            event=Notification.Event.ANNOUNCEMENT,
            text=announcement.title,
            link=announcement.link,
        )
        for user in users
    )


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """Staff write announcements here. A new one is sent when it's saved."""

    list_display = ["title", "created_at"]
    search_fields = ["title", "message"]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:
            send_announcement(obj)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "event", "text", "read", "created_at"]
    list_filter = ["kind", "read"]
    search_fields = ["user__username", "text"]
    readonly_fields = ["user", "kind", "event", "text", "link", "read", "created_at"]

    def has_add_permission(self, request):
        return False
