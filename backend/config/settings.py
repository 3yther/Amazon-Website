"""Django settings for T-SMILE.

Secrets and anything that changes between machines come from environment
variables: backend/.env locally (copy .env.example), and the host's settings
when deployed (see DEPLOYMENT.md).
"""
import os
import sys
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlsplit

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env if it exists. Real environment variables win over the file.
load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    """Read a true/false environment variable ("true", "1", "yes" count as true)."""
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name):
    """Read a comma-separated environment variable into a list, skipping blanks."""
    return [item.strip() for item in os.environ.get(name, "").split(",") if item.strip()]


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY is not set. Copy backend/.env.example to backend/.env "
        "and add a key (see the README for the command that generates one)."
    )

# Off unless explicitly switched on, so a missing variable never exposes debug pages.
DEBUG = env_bool("DJANGO_DEBUG", default=False)

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    # T-SMILE apps, split by domain
    "accounts",
    "content",
    "interest",
    "chatbot",
    "providers",
    "community",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # Must sit above CommonMiddleware so CORS headers are added to every response.
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def database_from_url(url):
    """Turns a postgres:// DATABASE_URL into a Django DATABASES entry."""
    parts = urlsplit(url)
    if parts.scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured(
            f"DATABASE_URL must be a postgres:// URL, not {parts.scheme or 'blank'}://."
        )
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parts.path.lstrip("/")),
        "USER": unquote(parts.username or ""),
        "PASSWORD": unquote(parts.password or ""),
        "HOST": parts.hostname or "",
        "PORT": str(parts.port or 5432),
        "CONN_MAX_AGE": 60,
        "CONN_HEALTH_CHECKS": True,
        "OPTIONS": dict(parse_qsl(parts.query)),
    }


# Uses DATABASE_URL if it's set (Railway sets it), otherwise SQLite for local development.
if os.environ.get("DATABASE_URL"):
    DATABASES = {"default": database_from_url(os.environ["DATABASE_URL"])}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# PRODUCTION: for AWS RDS just set DATABASE_URL (with ?sslmode=require).


# ---------------------------------------------------------------------------
# Auth (Django built-in: passwords are salted and hashed with PBKDF2)
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Tests only: a fast password hasher, because the tests make lots of users.
# Real passwords still use PBKDF2.
TESTING = len(sys.argv) > 1 and sys.argv[1] == "test"
if TESTING:
    PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "en-gb"
TIME_ZONE = "Europe/London"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static and uploaded files
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Uploaded content files (ContentItem.file). Stored on local disk in development.
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# PRODUCTION: store uploaded files on S3 with django-storages[s3]
# (set STORAGES and AWS_STORAGE_BUCKET_NAME, region eu-west-2).

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    # Closed by default. Public endpoints opt in with AllowAny in their view.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    # Rate limits for anonymous forms. PRODUCTION: use a shared cache like Redis.
    "DEFAULT_THROTTLE_RATES": {
        "interest": "10/hour",
        "feedback": "10/hour",
        # Each chat message costs an AI call, so this limits it.
        "chat": "60/hour",
        # The Community.
        "community_ask": "10/hour",
        "community_answer": "30/hour",
        "community_action": "120/hour",
        # Both password reset endpoints share this.
        "password_reset": "5/hour",
    },
}

if DEBUG:
    # The clickable browsable API is handy locally but not needed in production.
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )


# ---------------------------------------------------------------------------
# Email (password reset)
# ---------------------------------------------------------------------------

# No email account for the prototype, so emails are printed to the console
# (including the reset link). PRODUCTION: point EMAIL_BACKEND at Amazon SES.
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@t-smile.example")

# The front end address, used for the link in the password reset email.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


# ---------------------------------------------------------------------------
# AI assistant (the chatbot, Task 4)
# ---------------------------------------------------------------------------

# Anthropic API key for the chatbot. Only the server uses it. Without a key
# the site still works and Smiley answers from the site's own content.
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Lets Anthropic try another model if one declines. Set to false if the account doesn't support it.
ANTHROPIC_SERVER_SIDE_FALLBACK = env_bool("ANTHROPIC_SERVER_SIDE_FALLBACK", default=True)


# ---------------------------------------------------------------------------
# CORS and CSRF (the React front end is a separate app)
# ---------------------------------------------------------------------------

# Vite (locally) and Caddy (on Railway) pass /api to Django, so CORS isn't needed.
# CSRF_TRUSTED_ORIGINS still needs the frontend's https:// address on Railway.
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")


# ---------------------------------------------------------------------------
# Production hardening (applies whenever DEBUG is off)
# ---------------------------------------------------------------------------

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
    # Behind a proxy that handles HTTPS (Railway, AWS), Django reads
    # X-Forwarded-Proto to know the request was HTTPS. Only turn on behind such a proxy.
    if env_bool("DJANGO_BEHIND_HTTPS_PROXY"):
        SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

# Print 500 error tracebacks to the console (the host's log), even with DEBUG off.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
