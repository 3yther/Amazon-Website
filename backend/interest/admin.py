from django.contrib import admin

from .models import ExpressionOfInterest


@admin.register(ExpressionOfInterest)
class ExpressionOfInterestAdmin(admin.ModelAdmin):
    """
    Where Amazon staff review submissions. Read-only so what people sent is
    never changed; deleting is still allowed for data removal requests.
    """

    list_display = ["who", "email", "user_type", "pathway", "submitted_at"]
    list_filter = ["user_type", "pathway", "submitted_at"]
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
    ]

    @admin.display(description="Who", ordering="full_name")
    def who(self, interest):
        """The name if the account has one, otherwise the username.

        Sign-up collects no real name, so full_name is blank for most rows and
        a list of empty cells would be useless.
        """
        return interest.full_name or (interest.user.username if interest.user else "(unknown)")

    def has_add_permission(self, request):
        return False
