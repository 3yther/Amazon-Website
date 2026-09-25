"""The only file that talks to the AI (Anthropic's Claude).

Everything else calls get_ai_response(prompt, context). The key is in the
ANTHROPIC_API_KEY environment variable and never goes to the browser.
Any error becomes AssistantUnavailable, so the rest of the site keeps working.
"""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

# Claude Opus 5.5. Thinking is on by default on this model; "low" effort keeps it
# quick and cheap, which suits short grounded answers like ours.
MODEL = "claude-opus-5-5"
EFFORT = "low"

# Room for a short answer plus the model's own thinking tokens. Our prompt asks
# for under 90 words, so this is headroom, not a target.
MAX_TOKENS = 2000

# Fail fast. A visitor waiting on a chat reply would rather see the fallback
# message than a spinner, and the SDK retries once inside this budget.
TIMEOUT_SECONDS = 20
MAX_RETRIES = 1


class AssistantUnavailable(Exception):
    """No answer could be produced. The caller shows the fallback message."""


_client = None


def _get_client():
    """Build the Anthropic client once and reuse it, so connections are pooled."""
    global _client
    if _client is None:
        # Imported here so the site and tests still run without the package or a key.
        import anthropic

        api_key = settings.ANTHROPIC_API_KEY
        if not api_key:
            raise AssistantUnavailable("ANTHROPIC_API_KEY is not set")

        _client = anthropic.Anthropic(
            api_key=api_key,
            timeout=TIMEOUT_SECONDS,
            max_retries=MAX_RETRIES,
        )
    return _client


def _build_messages(prompt, history):
    """The conversation to send: earlier messages, then the new question.
    The API doesn't remember anything, so the whole conversation is sent each time.
    """
    messages = [{"role": turn["role"], "content": turn["content"]} for turn in history]
    messages.append({"role": "user", "content": prompt})
    return messages


def get_ai_response(prompt, context, history=()):
    """Asks the AI a question and returns the reply as text.

    prompt is what the visitor typed, context is the system prompt (rules and
    facts) and history is the earlier messages. Raises AssistantUnavailable if
    anything goes wrong.
    """
    # First, so a missing key fails straight away, without paying the second
    # or so it takes to import the SDK.
    client = _get_client()

    import anthropic

    # The rules and facts are the same every time, so they're cached (cheaper).
    request = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "output_config": {"effort": EFFORT},
        "system": [
            {"type": "text", "text": context, "cache_control": {"type": "ephemeral"}}
        ],
        "messages": _build_messages(prompt, history),
    }

    try:
        if settings.ANTHROPIC_SERVER_SIDE_FALLBACK:
            # If Claude says no to a message, the API tries another model.
            # Turn off with ANTHROPIC_SERVER_SIDE_FALLBACK=false if the account can't use it.
            response = client.beta.messages.create(
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                **request,
            )
        else:
            response = client.messages.create(**request)
    except anthropic.APITimeoutError as error:
        raise AssistantUnavailable("the assistant took too long to answer") from error
    except anthropic.RateLimitError as error:
        raise AssistantUnavailable("the assistant is busy right now") from error
    except anthropic.AuthenticationError as error:
        logger.error("Anthropic rejected our API key. Check ANTHROPIC_API_KEY.")
        raise AssistantUnavailable("the assistant is not set up correctly") from error
    except anthropic.APIStatusError as error:
        logger.error("Anthropic returned %s: %s", error.status_code, error.message)
        if error.status_code == 400 and settings.ANTHROPIC_SERVER_SIDE_FALLBACK:
            # A 400 here usually means the account can't use the fallback option.
            logger.error(
                "If this happens to every message, try ANTHROPIC_SERVER_SIDE_FALLBACK=false "
                "in backend/.env."
            )
        raise AssistantUnavailable("the assistant could not answer") from error
    except anthropic.APIConnectionError as error:
        raise AssistantUnavailable("could not reach the assistant") from error
    except Exception as error:  # noqa: BLE001
        # Last line of defence. Section 10 of the brief: if the AI service
        # breaks, the rest of the site must keep working.
        logger.exception("Unexpected error while calling the assistant")
        raise AssistantUnavailable("the assistant could not answer") from error

    if response.stop_reason == "refusal":
        # Claude declined the message on safety grounds. Nothing to show.
        logger.warning("The assistant declined to answer a message.")
        raise AssistantUnavailable("the assistant could not answer that one")

    reply = "".join(block.text for block in response.content if block.type == "text").strip()
    if not reply:
        raise AssistantUnavailable("the assistant returned an empty answer")
    return reply
