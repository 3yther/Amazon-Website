from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

# Same CSRF handling as register and login: DRF exempts its views from Django's
# check, so signed-out POSTs would not be checked at all. The mixin puts the
# check back. See the long comment at the top of accounts/views.py.
from accounts.views import CsrfCheckedMixin

from .knowledge import build_quiz_context, build_system_prompt
from .models import ChatMessage
from .provider import AssistantUnavailable, get_ai_response
from .serializers import ChatMessageSerializer, ChatRequestSerializer

# How much of the conversation to send back to the model. Six turns is enough
# for "what about Media?" to make sense after a question about Digital.
HISTORY_LIMIT = 12


def get_session_id(request):
    """
    The id that groups one conversation.

    Django's own session key, so guests get a conversation without an account
    and without us inventing another identifier to follow them around. A guest
    who has never had a session yet gets one here.
    """
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def conversation_queryset(request, session_id):
    """
    This visitor's messages.

    Signed in, the conversation follows the account, so it is still there on
    another day or another device. Signed out, it belongs to the session alone.
    """
    if request.user.is_authenticated:
        return ChatMessage.objects.filter(user=request.user)
    return ChatMessage.objects.filter(session_id=session_id, user__isnull=True)


def recent_messages(queryset, limit=HISTORY_LIMIT):
    """The last few messages, oldest first, without loading the whole history."""
    newest_first = list(queryset.order_by("-created_at")[:limit])
    return list(reversed(newest_first))


class ChatView(CsrfCheckedMixin, APIView):
    """
    GET  /api/chat/   the last few messages of this visitor's conversation
    POST /api/chat/   send a message, get the assistant's reply

    Open to everyone: guests chat without an account, and a signed-in visitor
    gets their conversation attached to their account so it keeps.

    POST body: message, plus optional audience (student | parent | teacher,
    from the question Smiley opens with), and quiz_question,
    quiz_correct_answer, quiz_chosen_answer and quiz_explanation when a wrong
    quiz answer started the conversation. Only message is ever stored.
    Returns 200 with {"reply": "..."}, 400 with field errors, 429 when rate
    limited, or 503 when the assistant itself is unavailable.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "chat"

    def get(self, request):
        # Deliberately does not start a session. Reading an empty history is not
        # a reason to give somebody a cookie; sending a message is, and POST
        # below does that. Data minimisation, same as the interest form.
        #
        # ai_available tells the widget whether an AI is set up at all. Without
        # one, Smiley answers from its own checked copy in the browser and does
        # not send (or store) questions nothing here could answer.
        ai_available = bool(settings.ANTHROPIC_API_KEY)
        session_id = request.session.session_key
        if not session_id and not request.user.is_authenticated:
            return Response({"messages": [], "ai_available": ai_available})

        messages = recent_messages(conversation_queryset(request, session_id))
        return Response(
            {
                "messages": ChatMessageSerializer(messages, many=True).data,
                "ai_available": ai_available,
            }
        )

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session_id = get_session_id(request)
        user = request.user if request.user.is_authenticated else None
        history = recent_messages(conversation_queryset(request, session_id))

        # The visitor's message is stored whether or not the answer works out:
        # they did send it, and the transcript should say so.
        ChatMessage.objects.create(
            session_id=session_id,
            user=user,
            role=ChatMessage.Role.USER,
            message=data["message"],
        )

        quiz_context = None
        if data.get("quiz_question"):
            quiz_context = build_quiz_context(
                data["quiz_question"],
                data.get("quiz_correct_answer", ""),
                data.get("quiz_explanation", ""),
                data.get("quiz_chosen_answer", ""),
            )

        try:
            reply = get_ai_response(
                prompt=data["message"],
                context=build_system_prompt(
                    quiz_context=quiz_context,
                    audience=data.get("audience") or None,
                    language=data.get("language") or None,
                ),
                history=[
                    {"role": message.role, "content": message.message} for message in history
                ],
            )
        except AssistantUnavailable as error:
            # The front end shows its own fallback message. Nothing else on the
            # site is affected, and no half-written reply is stored.
            return Response(
                {"detail": f"The assistant is unavailable: {error}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        ChatMessage.objects.create(
            session_id=session_id,
            user=user,
            role=ChatMessage.Role.ASSISTANT,
            message=reply,
        )
        return Response({"reply": reply})
