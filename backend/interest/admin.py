from django.contrib import admin

from .models import ExpressionOfInterest


@admin.register(ExpressionOfInterest)
class ExpressionOfInterestAdmin(admin.ModelAdmin):
    """
    Where Amazon staff review submissions. Read-only so what people sent is
    never changed; deleting is still allowed for data removal requests.
    """

    list_display = ["full_name", "email", "user_type", "pathway", "submitted_at"]
    list_filter = ["user_type", "pathway", "submitted_at"]
    search_fields = ["full_name", "email", "message"]
    list_select_related = ["pathway"]
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

    def has_add_permission(self, request):
        return False
