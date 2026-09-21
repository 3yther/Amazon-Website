from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Profile


class ProfileInline(admin.StackedInline):
    """Show and edit the profile on the built-in User page."""

    model = Profile
    can_delete = False
    readonly_fields = ["created_at"]


# Swap Django's default User admin for one that includes the profile.
admin.site.unregister(User)


@admin.register(User)
class UserWithProfileAdmin(UserAdmin):
    inlines = [ProfileInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "user_type", "pathway_interest", "created_at"]
    list_filter = ["user_type", "pathway_interest"]
    search_fields = ["user__username", "user__email"]
    list_select_related = ["user"]
    readonly_fields = ["created_at"]
