# T-SMILE

**Amazon Emerging Talent Digital T Level project** — information and advice about T Levels, free and gated digital content, and a way to register interest in Amazon's T Level opportunities, all in one place.

![Python](https://img.shields.io/badge/python-3.11-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Node](https://img.shields.io/badge/node-20.19%2B-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-production-4169E1?logo=postgresql&logoColor=white)

**Live preview:** https://frontend-production-2990.up.railway.app/

> Read [`CONTEXT.md`](CONTEXT.md) (stack, design rules, conventions) and [`MODELS.md`](MODELS.md) (the locked database schema) before changing anything.

## Contents

- [About](#about)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Admin](#admin)
- [Design principles](#design-principles)
- [Team](#team)
- [Notes](#notes)

## About

T-SMILE is a Django REST API (`backend/`) with a React (Vite) front end (`frontend/`), built for four audiences: students (16–18), parents and guardians, schools and teachers, and Amazon staff, who manage content and review submissions.

The site does three jobs:

- Explains T Levels in general, and at Amazon, by pathway (Digital, Business, Media, Finance, Engineering).
- Hosts a content library of guides, documents, videos and prep packs — some free, some gated behind sign-up.
- Captures Expressions of Interest from students, parents and teachers.

## Project layout

```
backend/
  config/      settings, root URLs
  accounts/    Profile (extends Django's built-in User)
  content/     Pathway, ContentItem, content API
  interest/    ExpressionOfInterest, submission API
  chatbot/     ChatMessage (model only for now)
frontend/
  src/api.js                    all calls to the Django API
  src/pages/ContentLibrary.jsx  example page: lists content from the API
  src/styles.css                colour tokens and styles
```

## Getting started

Needs **Python 3.11** and **Node 20.19+** (or 22.12+).

### Backend

In one terminal:

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

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### Open it

Visit **http://localhost:5173**. The Vite dev server forwards `/api` and `/media` to Django on port 8000. Add content at **http://localhost:8000/admin/**.

## Running tests

```bash
cd backend && python manage.py test
```

## Deployment

A preview build runs on [Railway](https://railway.com) so the team and mentor can use the site at a public URL — see [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full setup and environment variables. The final deployment target is AWS (EC2 + RDS + S3).

## API reference

| Method | URL | Notes |
| --- | --- | --- |
| GET | `/api/pathways/` | All pathways (not paginated) |
| GET | `/api/pathways/<slug>/` | One pathway |
| GET | `/api/content/` | Paginated. Filters: `pathway=<slug>`, `audience=student|parent|teacher`, `access_level=free|signup` |
| GET | `/api/content/<slug>/` | One item |
| POST | `/api/interest/` | Expression of Interest. Validated server side, rate limited |

Filtering by pathway also returns items for all pathways; filtering by audience also returns items for everyone. Sign-up content is listed for everyone, but its `file` link is only sent to signed-in users (`locked: true` otherwise).

## Admin

Amazon staff review Expressions of Interest at `/admin/`. Submissions are read-only there. A staff account needs "Staff status" plus the "Can view expression of interest" permission (or be a superuser).

## Design principles

- Amazon Orange `#FF9900` and Amazon Dark Blue `#232F3E` on warm off-white `#FAFAF7`. No purple, no gradients.
- Squared buttons, no pill shapes. SVG line icons, no emoji.
- Minimal, punchy copy. No filler, no fake reviews or metrics.
- WCAG 2.2 AA, and `prefers-reduced-motion` respected for any animation.

Full rules in [`CONTEXT.md`](CONTEXT.md).

## Team

Built by three T Level students:

- **Amir** — auth, accounts, data models, integration, AI chatbot
- **Aaron** — content library, resources, data-display pages
- **Micha** — Expression of Interest flow, accessibility

## Notes

- The pathway summaries in `backend/content/fixtures/pathways.json` are draft copy. Check them against gov.uk before launch.
- Production swaps SQLite for PostgreSQL on RDS and local files for S3. See the comments in `backend/config/settings.py`.
- Never commit `.env` files or `*.pem` keys.
