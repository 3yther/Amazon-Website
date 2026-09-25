"""Community moderation in Django admin.

Check Reports first. Posts can be hidden or restored. Hidden posts are kept,
not deleted, so there's a record.
"""
from django.contrib import admin

from .models import Answer, Question, Report


@admin.action(description="Hide from the Community")
def hide_posts(modeladmin, request, queryset):
    queryset.update(hidden=True, hidden_reason="staff")


@admin.action(description="Show again, and mark its reports as dealt with")
def restore_posts(modeladmin, request, queryset):
    queryset.update(hidden=False, hidden_reason="")
    for post in queryset:
        post.reports.update(resolved=True)


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    fields = ["author", "body", "is_accepted", "hidden", "created_at"]
    readonly_fields = ["author", "body", "created_at"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "topic", "pathway", "hidden", "hidden_reason", "created_at"]
    list_filter = ["hidden", "topic", "pathway", "created_at"]
    search_fields = ["title", "body", "author__username"]
    list_select_related = ["author", "pathway"]
    readonly_fields = ["author", "created_at"]
    actions = [hide_posts, restore_posts]
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ["short_body", "question", "author", "is_accepted", "hidden", "created_at"]
    list_filter = ["hidden", "is_accepted", "created_at"]
    search_fields = ["body", "author__username", "question__title"]
    list_select_related = ["author", "question"]
    readonly_fields = ["author", "question", "created_at"]
    actions = [hide_posts, restore_posts]

    @admin.display(description="Answer")
    def short_body(self, answer):
        return answer.body[:80]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["reason", "post", "reporter", "resolved", "created_at"]
    list_filter = ["resolved", "reason", "created_at"]
    list_editable = ["resolved"]
    readonly_fields = ["reporter", "question", "answer", "reason", "note", "created_at"]

    def has_add_permission(self, request):
        return False
