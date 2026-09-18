# T-SMILE — Shared Project Context

> Paste this into Claude (or Claude Code) at the START of every coding session so
> everyone's AI output stays consistent. Keep this file updated as decisions change.

## What we are building
T-SMILE: a single responsive website for the Amazon Emerging Talent Digital T Level
project. It informs people about T Levels (general + at Amazon), gives content
(some free, some behind a sign-up), and captures Expressions of Interest.

Audiences: students (16-18), parents/guardians, schools/teachers, Amazon staff (who
receive interest submissions and manage content).

## Tech stack (agreed — do not change without team agreement)
- Backend: Python 3.11 + Django
- Frontend: HTML, CSS, JavaScript, React
- Database: PostgreSQL (SQLite locally for dev is fine)
- Hosting: AWS (EC2 + RDS + S3), UK/EU region
- Version control: GitHub, branch + pull-request workflow

## Design rules (STRICT — these define our look, do not break them)
- Colours: Amazon Orange #FF9900 and Amazon Dark Blue #232F3E only, on warm
  off-white #FAFAF7. No purple. No gradients.
- No pill-shaped buttons (squared, small radius). No emoji icons (use SVG line icons).
- No em dashes anywhere in copy. No vacuous filler text. No fake reviews/metrics/accounts.
- Keep website copy minimal and punchy. Fewer words, said with more weight.
- Bolder typography for headings; monospace for small labels.
- Respect prefers-reduced-motion for any animation.
- Accessibility target: WCAG 2.2 AA.

## Conventions (so three people's code fits together)
- Django app names: lowercase, singular where sensible (accounts, content, interest).
- Templates: one base template all pages extend; shared header/footer as includes.
- CSS: define colours once as variables; reuse, do not hardcode hex per page.
- Branch names: feat/<area> (e.g. feat/auth, feat/resources, feat/eoi).
- Never commit secrets, .env files, or *.pem keys. Check .gitignore first.
- Write short docstrings/comments so a teammate (and a marker) can follow the code.

## Security (mentor stressed this)
- Passwords hashed + salted (Django does this by default — use Django auth, do not roll your own).
- Validate all user input server-side.
- Database is never public; secrets live in environment variables, not in code.

## Who owns what (code)
- Amir: auth + accounts + data models + integration + AI chatbot (Task 4)
- Aaron: content library + resources + pages that display data
- Micha: expression of interest + accessibility build
(Adjust to match reality.)
