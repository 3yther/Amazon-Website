# T-SMILE

Website for the Amazon Emerging Talent Digital T Level project. Django REST API
in `backend/`, React (Vite) front end in `frontend/`.

Read [CONTEXT.md](CONTEXT.md) (stack, design rules, conventions) and
[MODELS.md](MODELS.md) (the locked database schema) before changing anything.

## Layout

```
backend/
  config/      settings, root URLs
  accounts/    Profile (extends Django's built-in User)
  content/     Pathway, ContentItem, content API
  interest/    ExpressionOfInterest, submission API
  chatbot/     ChatMessage (model only for now)
frontend/
  src/api.js                  all calls to the Django API
  src/pages/ContentLibrary.jsx  example page: lists content from the API
  src/styles.css              colour tokens and styles
```

## Run locally

Needs Python 3.11 and Node 20.19+ (or 22.12+).

Back end, in one terminal:

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
# paste the printed key into .env as DJANGO_SECRET_KEY
python manage.py migrate
python manage.py loaddata pathways   # optional: the five pathways
python manage.py createsuperuser
python manage.py runserver
```

Front end, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server forwards `/api` and `/media` to
Django on port 8000. Add content at http://localhost:8000/admin/.

Tests: `cd backend && python manage.py test`

## API

| Method | URL | Notes |
| --- | --- | --- |
| GET | `/api/pathways/` | All pathways (not paginated) |
| GET | `/api/pathways/<slug>/` | One pathway |
| GET | `/api/content/` | Paginated. Filters: `pathway=<slug>`, `audience=student\|parent\|teacher`, `access_level=free\|signup` |
| GET | `/api/content/<slug>/` | One item |
| POST | `/api/interest/` | Expression of Interest. Validated server side, rate limited |

Filtering by pathway also returns items for all pathways; filtering by audience
also returns items for everyone. Sign-up content is listed for everyone, but
its `file` link is only sent to signed-in users (`locked: true` otherwise).

## Admin

Amazon staff review Expressions of Interest at `/admin/`. Submissions are
read-only there. A staff account needs "Staff status" plus the "Can view
expression of interest" permission (or be a superuser).

## Notes

- The pathway summaries in `backend/content/fixtures/pathways.json` are draft
  copy. Check them against gov.uk before launch.
- Production swaps SQLite for PostgreSQL on RDS and local files for S3. See the
  comments in `backend/config/settings.py`.
- Never commit `.env` files or `*.pem` keys.
