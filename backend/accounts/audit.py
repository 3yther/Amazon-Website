"""
The Admin Portal's audit log: who did what, to what, and when.

WHY THIS EXISTS. Account removal deletes the row and everything cascading off
it, and until now it left no trace: afterwards there was no way to tell whether
an account had been removed or had never existed, let alone by whom. The same
goes for deleting somebody's post or taking a staff account's access away.

WHAT IT IS NOT. It is not a security control and it is not tamper-proof:
anybody with database access can edit it. It is a record for the people running
the site, so a question like "where did that account go" has an answer.

HOW TO USE IT. One call at the point the thing actually happened, after it
succeeded, never before:

    record(request, AdminAuditLog.Action.ACCOUNT_REMOVED, target=person,
           detail={"username": person.username})

Recording must never be what breaks a staff action, so `record` swallows its
own errors: a full disk should not turn a successful deletion into a 500 after
the row has already gone.
"""
import logging

from .models import AdminAuditLog

logger = logging.getLogger(__name__)


def record(request, action, target=None, target_label="", detail=None):
    """
    Write one entry. Call it after the action succeeded.

    `target` is any model instance; its class name and primary key are stored
    as text. `target_label` is what a human would recognise it by (a username,
    the start of a post), because the row it points at is often gone.

    Never raises. An audit log that can turn a completed deletion into a 500
    is worse than one with a gap in it, and the gap is logged.
    """
    try:
        actor = getattr(request, "user", None)
        signed_in = bool(actor and actor.is_authenticated)

        return AdminAuditLog.objects.create(
            actor=actor if signed_in else None,
            actor_username=actor.username if signed_in else "",
            action=action,
            target_type=type(target).__name__ if target is not None else "",
            target_id=str(getattr(target, "pk", "") or ""),
            target_label=str(target_label)[:200],
            detail=detail or {},
        )
    except Exception:  # noqa: BLE001 - see the docstring: never break the action
        logger.exception("Could not write an admin audit log entry for %s", action)
        return None
