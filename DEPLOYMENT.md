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
| `backend/railway.toml` | Build with Railpack; before each deploy run migrations, load the five pathways, starter resources and starter providers, then geocode any provider with no position; start with gunicorn. **Not currently read by Railway, see below.** |
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
     itself when a Root Directory is set). **On our preview this was never
     actually set, so the toml is ignored: see "Where the deploy settings
     really live" below before changing it.**
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

## Where the deploy settings really live

**Settled, 24 September 2026, after this cost us a working feature.** The
answer is the dashboard, and `backend/railway.toml` is not part of it:

- The `backend` service has no Config File Path set, so Railway has never
  read that file. Its own API reports `railwayConfigFile: null`.
- Config as Code is now **deprecated by Railway anyway.** The CLI says
  existing files keep working until 2026-12-01 and points at Infrastructure
  as Code (`.railway/railway.ts`) instead. So switching it on is not the fix;
  it is a dead end with a date on it.
- **The Pre-deploy Command in `backend` -> Settings -> Deploy is the field
  that runs.** It is the only place this setting lives.

The toml is kept in the repo, correct and in step with this page, so the
command is reviewable in a pull request and there is something to migrate
from if the team moves to `.railway/railway.ts`. It changes nothing on its
own. Do not edit it and expect a deploy to notice.

### What that field must say

```
sh -c 'python manage.py migrate --noinput && python manage.py loaddata pathways resources providers && python manage.py geocode_providers && python manage.py check_providers'
```

Four steps, and each one matters:

| Step | Why |
|---|---|
| `migrate` | schema |
| `loaddata pathways resources providers` | **`providers` was missing.** Without it the table is empty and every near-you search answers "none found". |
| `geocode_providers` | turns each provider's postcode into a position. A provider without one is left out of the search. Safe to repeat; it does nothing when there is nothing to do. |
| `check_providers` | **fails the deploy if the two above did not work.** This is the step that stops it happening again quietly. |

`check_providers` only exists once the pull request that added it is merged.
Until then leave it off the end, or the pre-deploy step fails on an unknown
command and the deploy never goes live.

### How this was missed

The command that actually ran was:

```
sh -c 'python manage.py migrate --noinput && python manage.py loaddata pathways resources'
```

No `providers`, no `geocode_providers`. Both had been written into
`railway.toml` only, which nothing reads. The deploy log said
`Installed 28 object(s) from 2 fixture(s)`, which is pathways (5) plus
resources (23) and no providers at all, and the search endpoint answered a
perfectly healthy `200 {"count": 0, "results": []}` to every visitor. No
error anywhere, and the backend suite green throughout, because the tests
load the fixture themselves rather than depending on a deploy having done it.

## Environment variables

### backend service

| Variable | Set it to | What it is for |
|---|---|---|
| `DJANGO_SECRET_KEY` | A new random key (see below). Never reuse one from a local `.env`. | Signs sessions and CSRF tokens. Django will not start without it. |
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` | Connects Django to Railway's PostgreSQL. When unset, Django uses local SQLite. |
| `DJANGO_ALLOWED_HOSTS` | `${{ RAILWAY_PUBLIC_DOMAIN }}` | The backend's own domain. Django refuses requests addressed to any other host. |
| `CSRF_TRUSTED_ORIGINS` | `https://${{ frontend.RAILWAY_PUBLIC_DOMAIN }}` | Log in, sign up and log out are sent from the frontend's origin; Django only accepts them from origins listed here. |
| `DJANGO_BEHIND_HTTPS_PROXY` | `true` | Railway ends HTTPS before Django. This lets Django trust Railway's `X-Forwarded-Proto` header instead of redirecting forever. |
| `ANTHROPIC_API_KEY` | A key from console.anthropic.com. Never commit it. | The AI assistant. Without it the rest of the site works, but the chat widget only shows its fallback message. |

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
- Asking the assistant a question gets a real answer, not the fallback message
  (that confirms `ANTHROPIC_API_KEY` is set).
- Signing up logs you in, and logging out works (that confirms the CSRF setup).
- Find T-Levels Near You returns colleges for a postcode such as `W1D 3QU` at
  50 miles. **Check this by hand after any deploy that touches the pre-deploy
  command.** An empty answer is a 200 with an empty list, so nothing else
  will tell you. Without a browser:

  ```bash
  curl -s "https://<backend domain>/api/providers/search/?postcode=W1D%203QU&radius=50" | head -c 200
  ```

  A healthy answer has a `count` above zero. A zero means the providers
  fixture did not load or `geocode_providers` did not run; the backend log
  now says which of the two it was.
- `https://<backend domain>/admin/` shows the Django admin login.
- In the backend's deploy logs, the pre-deploy step shows the migrations, and
  the service log shows gunicorn listening.
- If an `/api` request answers 500, the traceback is in the backend's service
  log (`railway logs`). `LOGGING` in `backend/config/settings.py` prints every
  server error there, even with debug off.

## Known limits of the preview

- **Admin pages are unstyled.** With debug off, nothing serves Django's own
  CSS and JavaScript. The admin still works. Adding WhiteNoise would fix it,
  or S3 on AWS.
- **Uploaded content files are not kept or served.** Railway's disk is reset
  on every deploy, and Django only serves `/media` in debug mode. Content items
  without a file are fine. Files belong in S3, planned for AWS.
- **The five pathways, the starter resources and the starter providers are
  reloaded on every deploy**, from `backend/content/fixtures/pathways.json`,
  `resources.json` and `backend/providers/fixtures/providers.json`. Edits to
  them made in the admin are overwritten, so change the fixture instead.
  Resources and providers added in the admin are kept.
- **Provider positions come from postcodes.io**, a free service with no API
  key. The deploy calls it only for providers that have no position yet, so a
  normal redeploy makes no calls at all. If it is unreachable the step warns
  and the deploy carries on, because the fixture already carries correct
  coordinates.
- **Its data is separate.** Users and content on the preview live in
  Railway's PostgreSQL, not in anyone's local `db.sqlite3`.
- **No HSTS.** Deliberately left off for a temporary address. Worth adding on
  the final AWS domain.

## Undoing it

Delete `backend/railway.toml`, `backend/.python-version`,
`frontend/railway.toml`, `frontend/Caddyfile` and this file. The settings
changes do nothing unless `DATABASE_URL` or `DJANGO_BEHIND_HTTPS_PROXY` is
set, so local development is unaffected either way.
