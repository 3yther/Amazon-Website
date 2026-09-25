# T-SMILE

Our website for the **Amazon Emerging Talent Digital T-Level project**. It explains T-Levels (in general and at Amazon), has a library of free resources, and lets people register interest in an Amazon placement.

[![CI](https://github.com/3yther/Amazon-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/3yther/Amazon-Website/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/python-3.11-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Node](https://img.shields.io/badge/node-22%2B-339933?logo=node.js&logoColor=white)

**Live preview:** https://tsmile.up.railway.app/ (temporary, on Railway)

Read [`CONTEXT.md`](CONTEXT.md) (rules and conventions) and [`MODELS.md`](MODELS.md) (database) before changing anything.

## What it does

- **T-Level info** for the five pathways: Digital, Business, Media, Finance and Engineering
- **Resources** library of guides, videos and packs from gov.uk, UCAS and others
- **Register interest** form for Amazon placements (no account needed)
- **Find T-Levels near you** by postcode
- **Community** where people ask and answer questions (posts are checked first)
- **Smiley**, a chat helper that answers from the site's own content, and uses the AI only for questions it can't match
- **10 languages**: English plus Polish, Romanian, Panjabi, Urdu, Portuguese, Spanish, Arabic, Bengali and Gujarati (machine translated)
- **Accessibility settings** like font size, high contrast, dark mode and reduce motion
- **Staff page** where Amazon staff see interest submissions

## Screenshots

![T-SMILE homepage](docs/screenshots/home-hero.png)
![Homepage audience cards](docs/screenshots/home-audiences.png)
![The five pathways](docs/screenshots/pathways.png)
![Help page](docs/screenshots/help.png)
![Sign up page](docs/screenshots/signup.png)

## Project layout

```
backend/
  config/      settings and URLs
  accounts/    profiles, settings, feedback, staff permission
  content/     pathways and resources
  interest/    Expressions of Interest
  providers/   schools and colleges for the near-you search
  chatbot/     Smiley's API and checked facts
  community/   questions, answers, reports and the post filter
frontend/src/
  api.js       every call to the Django API
  pages/       one file per page
  components/  shared parts
  assistant/   Smiley
  i18n/        translations
  tests/       frontend tests
```

## Running it locally

You need **Python 3.11** and **Node 22 or newer**.

Backend (first terminal):

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
# put that key in .env as DJANGO_SECRET_KEY
python manage.py migrate
python manage.py loaddata pathways resources providers
python manage.py createsuperuser
python manage.py runserver
```

Frontend (second terminal):

```bash
cd frontend
npm install
npm run dev
```

Then go to **http://localhost:5173**. Vite sends `/api` and `/media` to Django on port 8000. The admin is at **http://localhost:8000/admin/**.

### Environment variables

Copy `backend/.env.example` to `backend/.env`. Never commit a real `.env`.

| Variable | When | What for |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Always | Signs sessions. Make one with the command above |
| `DJANGO_DEBUG` | Local | `True` locally, leave unset when deployed |
| `DJANGO_ALLOWED_HOSTS` | Always | e.g. `localhost,127.0.0.1` |
| `DATABASE_URL` | Deployed | PostgreSQL URL. Leave unset locally to use SQLite |
| `DJANGO_BEHIND_HTTPS_PROXY` | Deployed | `true` on Railway |
| `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS` | Sometimes | Only if the front end is on a different address from the API |
| `ANTHROPIC_API_KEY` | Optional | Lets Smiley use the AI. Server only, never commit it |
| `ANTHROPIC_SERVER_SIDE_FALLBACK` | Rarely | `false` if the API rejects the fallback option |

The frontend usually needs nothing. `VITE_API_BASE_URL` is only for hosting the front end somewhere other than the API. Deployment variables are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Tests

```bash
cd backend && python manage.py test
cd frontend && npm test
```

The frontend tests use Vitest, Testing Library and axe (for WCAG 2.2 AA checks). Colour contrast still has to be checked by hand. CI runs both on every pull request and every push to `main`.

## API

| Method | URL | Notes |
| --- | --- | --- |
| GET | `/api/pathways/` | All pathways |
| GET | `/api/content/` | Resources. Filters: `pathway`, `audience`, `access_level` |
| POST | `/api/interest/` | Register interest. Rate limited |
| GET | `/api/interest/submissions/` | Amazon staff only |
| GET | `/api/providers/search/` | `postcode` (required), `pathway`, `radius` (default 15 miles) |
| GET, POST | `/api/chat/` | Smiley. `503` if the AI is down |
| GET, POST | `/api/community/questions/` | List or ask. Filters: `topic`, `pathway`, `q`, `sort` |
| POST | `/api/community/questions/<id>/answers/` | Answer a question |
| POST | `/api/community/<questions or answers>/<id>/helpful/` | Mark helpful |
| POST | `/api/community/<questions or answers>/<id>/report/` | Report a post |
| various | `/api/accounts/...` | Sign up, log in, log out, profile, settings, passwords, feedback |

## Admin

Staff use `/admin/` to read interest submissions, manage resources, and hide or restore Community posts. Staff accounts are made by hand in the admin (you can't sign up as staff).

## How we work

- Branch off `main` (`feat/<thing>` or `fix/<thing>`), push, open a pull request
- Nothing goes straight to `main`
- Never commit secrets, `.env` files or `*.pem` keys

## Problems we hit

- **Wrong Python or Node version:** check with `python3.11 --version` and `node --version`
- **Resources filter is empty:** run `python manage.py loaddata pathways resources`
- **`/api` fails in the browser:** Django isn't running on port 8000
- **Django won't start:** `DJANGO_SECRET_KEY` is missing from `.env`

## Notes

- Translations are in `frontend/src/i18n/`. Change `messages/en.js` first, then the other languages. A test checks they all match.
- Smiley's facts are copied from `frontend/src/aboutContent.js`, and a test fails if they don't match. Run `python manage.py check_chat_facts` to see what it can't answer yet.
- The pathway summaries in `backend/content/fixtures/pathways.json` are drafts. Check them against gov.uk before launch.

## Team

Made by five T-Level students:

- **Amir**: the framework for the whole site
- **Aaron**: Smiley, the AI chatbot
- **Micha**: About, Help and T-Levels at Amazon pages, and accessibility
- **Jakub**: sign up and log in pages
- **Lloyd**: Find T-Levels Near You page

## Licence

A student project for the Amazon Emerging Talent Digital T-Level programme, for viewing and assessment only. All rights reserved, see [`LICENSE`](LICENSE). "Amazon" belongs to Amazon.com, Inc. and this is not an official Amazon product.
