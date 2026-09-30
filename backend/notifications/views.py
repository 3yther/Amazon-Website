from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "kind", "event", "text", "link", "read", "created_at"]


class NotificationListView(APIView):
    """GET /api/notifications/   the latest 20, and how many are unread."""

    permission_classes = [IsAuthenticated]

    def get_authenticate_header(self, request):
        return "Session"  # so signed-out requests get a 401

    def get(self, request):
        mine = Notification.objects.filter(user=request.user)
        return Response(
            {
                "unread": mine.filter(read=False).count(),
                "results": NotificationSerializer(mine[:20], many=True).data,
            }
        )


class MarkAllReadView(APIView):
    """POST /api/notifications/read/   mark everything as read."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"unread": 0})


class MarkOneReadView(APIView):
    """POST /api/notifications/<id>/read/   mark one as read (when it's clicked)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.read = True
        notification.save(update_fields=["read"])
        return Response({"read": True})
