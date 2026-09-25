"""Lists the facts Smiley still has no answer for.

    python manage.py check_chat_facts

Fill them in chatbot/knowledge.py. Exits 1 if anything is missing.
"""
from django.core.management.base import BaseCommand

from chatbot.knowledge import VERIFIED_FACTS, content_gaps


class Command(BaseCommand):
    help = "List the assistant's content gaps: facts nobody has written yet."

    def handle(self, *args, **options):
        gaps = content_gaps()
        written = len(VERIFIED_FACTS) - len(gaps)

        self.stdout.write(f"{written} of {len(VERIFIED_FACTS)} facts are written.")

        if not gaps:
            self.stdout.write(self.style.SUCCESS("No gaps. The assistant can answer them all."))
            return

        self.stdout.write("")
        self.stdout.write(self.style.WARNING(f"{len(gaps)} still to write:"))
        for fact in gaps:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"  {fact.topic}"))
            for line in _wrap(fact.note):
                self.stdout.write(f"    {line}")

        self.stdout.write("")
        self.stdout.write("Fill these in backend/chatbot/knowledge.py (VERIFIED_FACTS).")
        # Not an error, but a non-zero exit makes this usable as a check.
        raise SystemExit(1)


def _wrap(text, width=76):
    """Wrap a note to the terminal without pulling in another dependency."""
    words, lines, current = text.split(), [], ""
    for word in words:
        if len(current) + len(word) + 1 > width:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        lines.append(current)
    return lines
