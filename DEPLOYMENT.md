# Railway preview deployment

A temporary preview of T-SMILE on [Railway](https://railway.com), so the team
and mentor can use it at a public URL. The final deployment is still AWS (see
CONTEXT.md). Nothing here changes local development.

## How it fits together

```
browser ──https──▶ frontend service (Caddy)
                     ├── serves the built React app
                     └── /api/* and /media/* ──▶ backend service (gunicorn + Django) ──▶ PostgreSQL
```

Visitors only ever use the frontend's URL. The frontend service passes `/api`
on to Django, just as the Vite dev server does locally, so the browser sees one
origin. That keeps the login and CSRF cookies first-party. It matters on
Railway: `up.railway.app` is a public suffix, so a frontend and a backend on
two `*.up.railway.app` addresses count as different sites, and Safari blocks
cookies between them, which would break log in and sign up.

## What was added for this

| File | Purpose |
|---|---|
| `backend/railway.toml` | Build with Railpack; before each deploy run migrations and load the five pathways; start with gunicorn |
| `backend/.python-version` | Python 3.11, to match local development |
| `backend/requirements.txt` | Adds `gunicorn` and `psycopg[binary]` |
| `backend/config/settings.py` | Uses `DATABASE_URL` when set (SQLite otherwise); `DJANGO_BEHIND_HTTPS_PROXY` |
| `frontend/railway.toml` | Build with Railpack, which serves the Vite build with Caddy |
| `frontend/Caddyfile` | Serves the React app and passes `/api` and `/media` to Django |

## One-time setup on Railway

Names below assume the services are called `backend`, `frontend` and
`Postgres`. If yours differ, change the names inside the `${{ }}` references
to match.

1. Create a project and deploy this GitHub repo. That makes the first service;
   name it `backend`.
2. Add a PostgreSQL database to the project (Railway names it `Postgres`).
3. In the `backend` service's settings:
   - Root Directory: `/backend`
   - Config File Path: `/backend/railway.toml` (Railway does not find it by
     itself when a Root Directory is set)
   - Networking: generate a public domain
4. Add a second service from the same repo, name it `frontend`, and in its
   settings:
   - Root Directory: `/frontend`
   - Config File Path: `/frontend/railway.toml`
   - Networking: generate a public domain
5. Set the variables below on each service. Do this after generating both
   domains, since some variables refer to them.
6. Deploy (or redeploy) `backend`, then `frontend`.
7. To use the Django admin, create an admin account from a shell in the
   backend service, with the [Railway CLI](https://docs.railway.com/cli):
   `railway ssh --service backend`, then `python manage.py createsuperuser`.

## Environment variables

### backend service

| Variable | Set it to | What it is for |
|---|---|---|
| `DJANGO_SECRET_KEY` | A new random key (see below). Never reuse one from a local `.env`. | Signs sessions and CSRF tokens. Django will not start without it. |
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` | Connects Django to Railway's PostgreSQL. When unset, Django uses local SQLite. |
| `DJANGO_ALLOWED_HOSTS` | `${{ RAILWAY_PUBLIC_DOMAIN }}` | The backend's own domain. Django refuses requests addressed to any other host. |
| `CSRF_TRUSTED_ORIGINS` | `https://${{ frontend.RAILWAY_PUBLIC_DOMAIN }}` | Log in, sign up and log out are sent from the frontend's origin; Django only accepts them from origins listed here. |
| `DJANGO_BEHIND_HTTPS_PROXY` | `true` | Railway ends HTTPS before Django. This lets Django trust Railway's `X-Forwarded-Proto` header instead of redirecting forever. |

Generate a secret key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
```

Leave these unset on the backend:

- `DJANGO_DEBUG`: defaults to off. Never switch it on for a public URL.
- `DJANGO_SECURE_SSL_REDIRECT`: defaults to on.
- `CORS_ALLOWED_ORIGINS`: not needed, because the browser only talks to the
  frontend's origin.
- `PORT`: Railway sets it.

### frontend service

| Variable | Set it to | What it is for |
|---|---|---|
| `API_ORIGIN` | `https://${{ backend.RAILWAY_PUBLIC_DOMAIN }}` | Where Caddy sends `/api` and `/media` requests. Required: without it the site still loads, but every `/api` request fails with 503 and Caddy logs "no upstreams available". |

Leave these unset on the frontend:

- `VITE_API_BASE_URL`: empty means the app calls `/api` on its own origin,
  which Caddy passes to Django.
- `PORT`: Railway sets it.

## Checking it works

- The frontend's URL shows the homepage, and the Resources page lists the five
  pathways in its filter (that confirms `/api` reaches Django and the database).
- Signing up logs you in, and logging out works (that confirms the CSRF setup).
- `https://<backend domain>/admin/` shows the Django admin login.
- In the backend's deploy logs, the pre-deploy step shows the migrations, and
  the service log shows gunicorn listening.

## Known limits of the preview

- **Admin pages are unstyled.** With debug off, nothing serves Django's own
  CSS and JavaScript. The admin still works. Adding WhiteNoise would fix it,
  or S3 on AWS.
- **Uploaded content files are not kept or served.** Railway's disk is reset
  on every deploy, and Django only serves `/media` in debug mode. Content items
  without a file are fine. Files belong in S3, planned for AWS.
- **The five pathways are reloaded on every deploy**, from
  `backend/content/fixtures/pathways.json`. Edits to them made in the admin
  are overwritten, so change the fixture instead.
- **Its data is separate.** Users and content on the preview live in
  Railway's PostgreSQL, not in anyone's local `db.sqlite3`.
- **No HSTS.** Deliberately left off for a temporary address. Worth adding on
  the final AWS domain.

## Undoing it

Delete `backend/railway.toml`, `backend/.python-version`,
`frontend/railway.toml`, `frontend/Caddyfile` and this file. The settings
changes do nothing unless `DATABASE_URL` or `DJANGO_BEHIND_HTTPS_PROXY` is
set, so local development is unaffected either way.
