# T-SMILE: Shared Project Context

> Paste this into Claude (or Claude Code) at the START of every coding session so
> everyone's AI output stays consistent. Keep this file updated as decisions change.

## What we are building
T-SMILE: a single responsive website for the Amazon Emerging Talent Digital T Level
project. It informs people about T Levels (general and at Amazon), gives content
(some free, some behind a sign-up), captures Expressions of Interest, and has an
AI assistant that answers T Level questions.

Audiences: students (16-18), parents/guardians, schools/teachers, Amazon staff (who
receive interest submissions and manage content).

## Tech stack (agreed, do not change without team agreement)
- Backend: Python 3.11, Django 5.2, Django REST Framework (JSON API under `/api/`)
- Frontend: React 19 with React Router, built with Vite (a single-page app in `frontend/`)
- AI assistant: Anthropic API, called only from the backend (`backend/chatbot/`)
- Database: SQLite locally, PostgreSQL on the preview and in production
- Hosting: Railway for the shared preview (see DEPLOYMENT.md); AWS (EC2 + RDS + S3),
  UK/EU region, for the final deployment
- Version control: GitHub, branch + pull-request workflow, CI runs on every PR

## Design rules (STRICT, these define our look, do not break them)
- Colours: Amazon Orange #FF9900 and Amazon Dark Blue #232F3E only, on warm
  off-white #FAFAF7. No purple. No gradients.
- No pill-shaped buttons (squared, small radius). No emoji icons (use SVG line icons).
- Write "T-Level" and "T-Levels", with a hyphen, everywhere in copy. The only
  exception is the exact title of a published source we cite, e.g. "T Level
  Placements, About Amazon UK".
- No em dashes anywhere in copy. No vacuous filler text. No fake reviews/metrics/accounts.
- Keep website copy minimal and punchy. Fewer words, said with more weight.
- Bolder typography for headings; monospace for small labels.
- Respect prefers-reduced-motion for any animation.
- Accessibility target: WCAG 2.2 AA.
- Orange fails contrast as text or as the only indicator of state (about 2:1 on
  the page colour). Use it for decoration and fills; use dark blue for text,
  focus rings and selected-state markers.

## Conventions (so five people's code fits together)
- Django app names: lowercase, singular where sensible (accounts, content, interest, chatbot).
- React: pages in `frontend/src/pages/`, shared components in `frontend/src/components/`.
  Page copy and data live in separate files (e.g. `aboutContent.js`) so wording can
  change without touching components.
- CSS: colours and shared classes (`.label`, `.section-intro`, `.button`) are defined
  once in `styles.css`. A page's own CSS file only styles its own classes, never
  redefines shared ones (Vite bundles all CSS together, so an override leaks site-wide).
  Use the colour variables; never hardcode a hex or rgb value.
- Branch names: `feat/<area>` for features (e.g. `feat/chatbot`), `fix/<area>` for fixes.
  Nothing goes straight to `main`; open a PR and get it reviewed.
- Never commit secrets, .env files, or *.pem keys. Check .gitignore first.
- Write short docstrings/comments so a teammate (and a marker) can follow the code.

## Accessibility settings: what each one reaches

The controls on `/accessibility` are held by `AccessibilityPreferencesProvider`
(`frontend/src/hooks/useAccessibilityPreferences.jsx`), mounted at the root in
`main.jsx`. It writes flags onto `<html>` and `<body>`, and `styles.css` reads
them. Anything new that should answer a setting reads the same flag rather
than re-deriving it:

| Setting | How it reaches the page |
|---|---|
| Font size, text spacing | `--font-scale`, `--text-spacing` on `<html>` |
| High contrast | `body.high-contrast`, with a **separate pair of literal colours per theme**. Never build one of these out of `var(--blue)` or `var(--paper)`: those two swap meaning between light and dark, and aliasing them is what once turned every muted line of text into background-on-background in dark mode. |
| Theme | `html.dark-mode` / `html.light-mode` |
| Page background, focus outline | `body[data-page-background]`, `body[data-outline-style]` |
| Reduce motion | `html[data-motion="reduced" \| "full"]`, worked out from the site's own setting **and** the system one, the site's winning. CSS must ask this, not `@media (prefers-reduced-motion)` alone, or it will not hear the site's own toggle. |
| Colour blindness type | `html[data-colour-vision]`, which applies one of the SVG filters in `components/ColourVisionFilters.jsx` |

### Known limits

- **Colour vision correction is a filter on `<html>`.** That covers everything
  the browser paints for us, the menu drawer and the chat widget included
  (both render through a portal into `<body>`, so a filter any lower down
  would have missed them). Two things it cannot reach: the Amazon logo and
  the photographs, which are raster images we must not recolour anyway, and
  anything a third party would draw inside an `<iframe>`. There is no such
  iframe on the site today; if one is ever added, its contents will not be
  corrected and that has to be said out loud rather than assumed.
- **The correction is deliberately subtle here.** The palette is orange, dark
  navy and off-white, which are already told apart by lightness rather than
  hue, so the filter changes little on most pages. Where it earns its keep is
  the one red we use (`--danger`). Do not read "it looks nearly the same" as
  "it is not working".
- **Text to speech reads the chat assistant only.** It is `useSpeech.js`
  driving Smiley's replies. The site has no page reader; the setting's label
  says so. Building one is a separate piece of work.
- **Interface language saves but translates nothing.** English is the only
  language the site is written in, so the control is honest about the others
  being "coming soon" and that is all it does.

## Security (mentor stressed this)
- Passwords hashed and salted (Django does this by default; use Django auth, do not roll your own).
- Validate all user input server-side.
- Database is never public; secrets live in environment variables, not in code.
- The Anthropic API key stays on the backend. The browser never sees it.

## Roles and permissions
- Four account types live on `Profile.user_type`: student, parent, teacher, amazon_staff.
- **Only the first three can be self-registered.** `REGISTRATION_USER_TYPES` in
  `backend/accounts/serializers.py` deliberately leaves `amazon_staff` out, so nobody can
  sign themselves up as staff. **A staff account is made by hand in Django admin**: create
  the user, then set their Profile's user type to "Amazon staff".
- **What staff can see that nobody else can:** Expression of Interest submissions, including
  the submitter's name, email, user type, pathway and message. Everyone else, signed in or
  not, is refused.
- **Where the check lives:** `IsAmazonStaff` in `backend/accounts/permissions.py`. It fails
  closed, so a user with no Profile row is denied rather than erroring.
- The endpoint is `GET /api/interest/submissions/` (paginated, 20 per page), served by
  `ExpressionOfInterestListView` with its own read-only serializer. It is deliberately a
  separate URL from `POST /api/interest/`, which still answers 405 to GET for everyone and
  still echoes none of the personal fields back. Do not merge the two.
- The frontend page is `/staff` (`frontend/src/pages/StaffDashboard.jsx`), linked from the
  account menu for staff only. That link and the page's redirect are conveniences, not
  controls: the permission class is the actual gate.

## Who owns what (code)
- Amir: framework for the whole site (routing, layout, nav, footer, accounts, data models,
  settings), and the Railway preview
- Aaron: AI assistant (`frontend/src/assistant/`, `backend/chatbot/`)
- Micha: About, Help and T Levels at Amazon pages, plus accessibility across the site
- Jakub: sign up and log in pages
- Lloyd: Find Near You page
