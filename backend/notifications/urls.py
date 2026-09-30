from django.urls import path

from .views import MarkAllReadView, MarkOneReadView, NotificationListView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications"),
    path("read/", MarkAllReadView.as_view(), name="notifications-read"),
    path("<int:pk>/read/", MarkOneReadView.as_view(), name="notification-read"),
]
