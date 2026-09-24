"""Top-level URL routes. Each app owns its own API routes under /api/."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "T-SMILE admin"
admin.site.site_title = "T-SMILE admin"
admin.site.index_title = "Content, submissions and accounts"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("content.urls")),
    path("api/", include("providers.urls")),
    path("api/", include("interest.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("chatbot.urls")),
]

if settings.DEBUG:
    # Serve uploaded files locally. In production S3 serves them.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
