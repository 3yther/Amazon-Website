"""ASGI entry point, kept for async servers if we need them later (e.g. chatbot streaming)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_asgi_application()
