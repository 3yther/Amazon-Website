from django.contrib import admin
from django.utils import timezone

from notifications.models import Notification
from notifications.notify import notify

from .models import ExpressionOfInterest


@admin.register(ExpressionOfInterest)
class ExpressionOfInterestAdmin(admin.ModelAdmin):
    """
    Where Amazon staff review submissions. Read-only so what people sent is
    never changed; deleting is still allowed for data removal requests.
    """

    list_display = ["who", "email", "user_type", "pathway", "submitted_at", "seen_at"]
    list_filter = ["user_type", "pathway", "submitted_at", "seen_at"]
    actions = ["mark_seen"]
    search_fields = ["full_name", "email", "message", "user__username"]
    list_select_related = ["pathway", "user"]
    date_hierarchy = "submitted_at"
    readonly_fields = [
        "full_name",
        "email",
        "user_type",
        "pathway",
        "message",
        "user",
        "submitted_at",
        "seen_at",
    ]

    @admin.display(description="Who", ordering="full_name")
    def who(self, interest):
        """The name if the account has one, otherwise the username.

        Sign-up collects no real name, so full_name is blank for most rows and
        a list of empty cells would be useless.
        """
        return interest.full_name or (interest.user.username if interest.user else "(unknown)")

    @admin.action(description="Mark as seen by the team (notifies them)")
    def mark_seen(self, request, queryset):
        for interest in queryset.filter(seen_at__isnull=True):
            interest.seen_at = timezone.now()
            interest.save(update_fields=["seen_at"])
            notify(interest.user, Notification.Kind.INTEREST, Notification.Event.INTEREST_SEEN,
                   interest.pathway.name if interest.pathway else "", "/register-interest")

    def has_add_permission(self, request):
        return False
