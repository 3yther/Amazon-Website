"""
Django settings for T-SMILE.

Secrets and anything that changes between machines are read from environment
variables. Locally they come from backend/.env (copy .env.example, never commit
.env). Deployed, they are set on the host instead: Railway for the team
preview (see DEPLOYMENT.md), EC2 later.
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
    """
    Turn a postgres:// connection URL, the form Railway (and most hosts) give
    in DATABASE_URL, into a Django DATABASES entry. Anything in the query
    string, e.g. ?sslmode=require, is passed on to the driver.
    """
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


# With DATABASE_URL set (Railway sets it when a PostgreSQL database is attached)
# Django uses that database. Without it, local development uses SQLite, which
# needs no setup.
if os.environ.get("DATABASE_URL"):
    DATABASES = {"default": database_from_url(os.environ["DATABASE_URL"])}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# PRODUCTION: PostgreSQL on AWS RDS (UK/EU region) plugs in here. Setting
# DATABASE_URL (as above, with ?sslmode=require) also works for RDS.
# 1. Add "psycopg[binary]" to requirements.txt.
# 2. Set the POSTGRES_* variables on the server (see .env.example).
# 3. Replace the block above with:
#
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": os.environ["POSTGRES_DB"],
#         "USER": os.environ["POSTGRES_USER"],
#         "PASSWORD": os.environ["POSTGRES_PASSWORD"],
#         "HOST": os.environ["POSTGRES_HOST"],  # the RDS endpoint, never public
#         "PORT": os.environ.get("POSTGRES_PORT", "5432"),
#         "CONN_MAX_AGE": 60,
#         "OPTIONS": {"sslmode": "require"},
#     }
# }


# ---------------------------------------------------------------------------
# Auth (Django built-in: passwords are salted and hashed with PBKDF2)
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Tests only: a fast hasher. PBKDF2 is slow on purpose, which is what makes it
# safe, but the tests create hundreds of throwaway users and pay that cost
# every time. Real passwords, locally and deployed, still use PBKDF2.
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

# PRODUCTION: files go to S3, and only the link is kept in the database.
# Add "django-storages[s3]" to requirements.txt, set AWS_STORAGE_BUCKET_NAME and
# AWS_S3_REGION_NAME, then:
#
# STORAGES = {
#     "default": {"BACKEND": "storages.backends.s3.S3Storage"},
#     "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
# }
# AWS_STORAGE_BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]
# AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-west-2")
# AWS_QUERYSTRING_AUTH = True  # private bucket, signed links that expire

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
    # Limits anonymous spam on the Expression of Interest form.
    # PRODUCTION: throttling uses the cache, so point CACHES at a shared cache
    # (e.g. Redis) and set NUM_PROXIES when running behind a load balancer.
    "DEFAULT_THROTTLE_RATES": {
        "interest": "10/hour",
        "feedback": "10/hour",
        # Every chat message costs us an AI call, so this caps what one visitor
        # can spend. Generous enough for a real conversation.
        "chat": "60/hour",
        # The Community. Enough for a real conversation, not enough to flood it.
        "community_ask": "10/hour",
        "community_answer": "30/hour",
        "community_action": "120/hour",
        # Shared by both password reset endpoints. Generous enough for a
        # visitor who mistypes their new password once or twice, tight enough
        # that it cannot be used to spam an inbox or hammer the token check.
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

# No SMTP account has been set up for the prototype, so EMAIL_BACKEND defaults
# to Django's console backend: it writes the message, reset link included, to
# the server log instead of a real inbox. That is enough to build and test
# the reset flow end to end without needing real email delivery yet.
# PRODUCTION: set EMAIL_BACKEND (and DEFAULT_FROM_EMAIL) to point at Amazon
# SES instead, as noted as a stretch service in the proposal's Hosting and
# Data Architecture section. accounts/emails.py does not need to change.
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@t-smile.example")

# Where the link inside a password reset email points. The front end, not
# this API, since a visitor opens it in their browser.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


# ---------------------------------------------------------------------------
# AI assistant (the chatbot, Task 4)
# ---------------------------------------------------------------------------

# The key for Anthropic's API, which the chatbot app calls. It stays on the
# server: the browser never sees it, because React talks to /api/chat/ and
# Django makes the call. Without a key the site still works and the widget
# shows its fallback message, so nobody needs one to run the rest of T-SMILE.
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Lets Anthropic retry a declined message on another model inside the same
# call. Set ANTHROPIC_SERVER_SIDE_FALLBACK=false if the account does not have
# the feature and the API rejects the option.
ANTHROPIC_SERVER_SIDE_FALLBACK = env_bool("ANTHROPIC_SERVER_SIDE_FALLBACK", default=True)


# ---------------------------------------------------------------------------
# CORS and CSRF (the React front end is a separate app)
# ---------------------------------------------------------------------------

# Locally the Vite dev server passes /api to Django, and on the Railway preview
# the frontend service does the same (frontend/Caddyfile), so the browser sees
# one origin and CORS is not needed. CSRF_TRUSTED_ORIGINS still matters on
# Railway: Django is reached on its own domain while the browser's Origin
# header is the frontend's, so the frontend's https:// origin goes there.
# CORS only matters if the front end ever calls the API from another domain.
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
    # Behind a proxy that ends HTTPS and passes plain HTTP on (Railway, an AWS
    # load balancer), Django only knows a request was HTTPS from the proxy's
    # X-Forwarded-Proto header. Without this the redirect above would loop.
    # Only switch it on where such a proxy always sets that header, since
    # otherwise a client could fake it.
    if env_bool("DJANGO_BEHIND_HTTPS_PROXY"):
        SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

# Prints the traceback of every server error (a 500) to the console, even with
# DEBUG off. Deployed, that console is the host's log (`railway logs` on the
# preview), so a 500 always leaves a trace we can read. Visitors still only
# see a plain error: the traceback never goes into the response.
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
