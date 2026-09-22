"""
Django settings for T-SMILE.

Secrets and anything that changes between machines are read from environment
variables. Locally they come from backend/.env (copy .env.example, never commit
.env). In production they are set on the server (EC2) instead.
"""
import os
from pathlib import Path

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

# Local development uses SQLite, which needs no setup.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# PRODUCTION: PostgreSQL on AWS RDS (UK/EU region) plugs in here.
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
        # Every chat message costs us an AI call, so this caps what one visitor
        # can spend. Generous enough for a real conversation.
        "chat": "60/hour",
    },
}

if DEBUG:
    # The clickable browsable API is handy locally but not needed in production.
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )


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

# In local development the Vite dev server proxies /api to Django, so the browser
# sees one origin. These only matter when the front end is served from a
# different domain than the API.
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
    # Behind an AWS load balancer that ends HTTPS, uncomment so Django trusts it:
    # SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
