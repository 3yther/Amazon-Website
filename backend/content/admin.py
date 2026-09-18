from django.contrib import admin

from .models import ContentItem, Pathway


@admin.register(Pathway)
class PathwayAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "summary"]
    prepopulated_fields = {"slug": ["name"]}
    search_fields = ["name", "summary"]


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ["title", "content_type", "access_level", "audience", "pathway", "created_at"]
    list_filter = ["content_type", "access_level", "audience", "pathway"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ["title"]}
    list_select_related = ["pathway"]
    date_hierarchy = "created_at"
