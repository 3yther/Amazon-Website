from django.contrib import admin

from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Read-only transcript view for staff."""

    list_display = ["session_id", "role", "short_message", "user", "created_at"]
    list_filter = ["role", "created_at"]
    search_fields = ["session_id", "message", "user__username"]
    list_select_related = ["user"]
    readonly_fields = ["session_id", "user", "role", "message", "created_at"]

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message[:80]

    def has_add_permission(self, request):
        return False
