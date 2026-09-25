# Railway preview

A temporary preview of the site on [Railway](https://railway.com) so the team and our mentor can try it. The final version is meant to go on AWS. None of this changes local development.

## How it works

```
browser ──https──▶ frontend service (Caddy)
                     ├── serves the built React app
                     └── /api/* and /media/* ──▶ backend service (gunicorn + Django) ──▶ PostgreSQL
```

People only use the frontend's address. Caddy passes `/api` to Django, like Vite does locally, so the browser only sees one site. That matters because Safari blocks cookies between two different `*.up.railway.app` addresses, which would break logging in.

## Files for Railway

| File | What it does |
| --- | --- |
| `backend/railway.toml` | Build, pre-deploy and start commands. **Railway doesn't actually read it** (see below) |
| `backend/.python-version` | Python 3.11 |
| `backend/requirements.txt` | Includes `gunicorn` and `psycopg[binary]` |
| `frontend/railway.toml` | Build with Railpack, which serves the Vite build with Caddy |
| `frontend/Caddyfile` | Serves the React app and passes `/api` and `/media` to Django |

## Setting it up

1. Make a Railway project from this GitHub repo and call the first service `backend`.
2. Add a PostgreSQL database (Railway calls it `Postgres`).
3. `backend` settings: Root Directory `/backend`, and generate a public domain.
4. Add a second service from the same repo called `frontend`: Root Directory `/frontend`, Config File Path `/frontend/railway.toml`, and generate a public domain.
5. Set the variables below, then deploy `backend` and then `frontend`.
6. To make an admin account: `railway ssh --service backend`, then `python manage.py createsuperuser`.

## The pre-deploy command

Railway ignores `backend/railway.toml` (no Config File Path is set, and Railway is dropping config files after 1 December 2026 anyway). The command that really runs is in **backend → Settings → Deploy → Pre-deploy Command** on the dashboard. It must be:

```
sh -c 'python manage.py migrate --noinput && python manage.py loaddata pathways resources providers && python manage.py geocode_providers && python manage.py check_providers'
```

- `migrate` updates the database
- `loaddata ... providers` loads the colleges. We once left `providers` out and every near-you search came back empty with no error
- `geocode_providers` gives each college a position (does nothing if they already have one)
- `check_providers` stops the deploy if there are no colleges to search

We keep `railway.toml` matching this so the command can be reviewed in a pull request, but changing the file does nothing by itself.

## Variables

**backend**

| Variable | Value |
| --- | --- |
| `DJANGO_SECRET_KEY` | A new random key (don't reuse a local one) |
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` |
| `DJANGO_ALLOWED_HOSTS` | `${{ RAILWAY_PUBLIC_DOMAIN }}` |
| `CSRF_TRUSTED_ORIGINS` | `https://${{ frontend.RAILWAY_PUBLIC_DOMAIN }}` |
| `DJANGO_BEHIND_HTTPS_PROXY` | `true` |
| `ANTHROPIC_API_KEY` | Key from console.anthropic.com (optional, never commit it) |

Leave `DJANGO_DEBUG`, `DJANGO_SECURE_SSL_REDIRECT`, `CORS_ALLOWED_ORIGINS` and `PORT` unset.

**frontend**

| Variable | Value |
| --- | --- |
| `API_ORIGIN` | `https://${{ backend.RAILWAY_PUBLIC_DOMAIN }}` (without it every `/api` call fails with a 503) |

Leave `VITE_API_BASE_URL` and `PORT` unset.

Make a secret key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
```

## Checking it works

- The homepage loads and the Resources filter shows the five pathways
- Signing up logs you in, and logging out works
- Smiley answers questions
- `/admin/` on the backend shows the Django login
- Find T-Levels Near You shows colleges for `W1D 3QU` at 50 miles. Check this after any change to the pre-deploy command:

  ```bash
  curl -s "https://<backend domain>/api/providers/search/?postcode=W1D%203QU&radius=50" | head -c 200
  ```

  A `count` of 0 means the providers didn't load.
- Server errors (500s) are printed in the backend log (`railway logs`)

## Known problems

- The admin pages have no styling (debug is off, so nothing serves Django's CSS). They still work.
- Uploaded files are lost on each deploy. Files should go on S3 when we move to AWS.
- The pathways, resources and providers are reloaded every deploy, so edit the fixture files instead of changing them in the admin.
- The preview has its own database, separate from everyone's local one.
- No HSTS yet. Add it on the final AWS domain.

## Removing it

Delete `backend/railway.toml`, `backend/.python-version`, `frontend/railway.toml`, `frontend/Caddyfile` and this file. The settings only do anything when `DATABASE_URL` or `DJANGO_BEHIND_HTTPS_PROXY` is set.
