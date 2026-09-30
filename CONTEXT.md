# T-SMILE: project context

> Paste this into Claude at the start of each coding session so everyone's AI output matches. Update it when we change a decision.

## What we're building

One website for the Amazon Emerging Talent Digital T-Level project. It explains T-Levels (in general and at Amazon), has a resources library, takes Expressions of Interest, and has Smiley, a chat helper for T-Level questions.

Who it's for: students (16 to 18), parents and guardians, teachers and schools, and Amazon staff (who read the interest submissions and manage content).

## Tech stack (don't change without asking the team)

- Backend: Python 3.14, Django 6.1, Django REST Framework (API under `/api/`)
- Frontend: React 19, React Router, Vite
- AI: Anthropic API, only called from the backend (`backend/chatbot/`)
- Database: SQLite locally, PostgreSQL on Railway and in production
- Hosting: Railway for the preview (see DEPLOYMENT.md), AWS in the UK/EU for the final version
- GitHub with branches and pull requests, CI runs on every pull request

## Design rules

- Colours: Amazon Orange #FF9900 and Amazon Dark Blue #232F3E on off-white #FAFAF7. No purple, no gradients.
  The one exception is the Admin Portal's charts, below.
- Square buttons with a small radius, no pill shapes. SVG line icons, no emoji.
- Write "T-Level" and "T-Levels" with a hyphen. Only exception: the exact title of a source we cite.
- No em dashes. No filler text. No fake reviews, numbers or accounts.
- Keep the words short and to the point.
- Bold headings, monospace for small labels.
- Any animation has to stop with reduced motion.
- Aim for WCAG 2.2 AA.
- Orange is too faint for text (about 2:1), so only use it for decoration and fills. Text, focus rings and selected states are dark blue.

### The Admin Portal's data palette (the one colour exception)

Charts with six series cannot be read in two colours, so `styles.css` defines
seven data colours scoped to `.admin-shell`: orange and dark blue first, then
sky, teal, amber, green and a soft neutral. Still no purple and no gradients,
and they are solid fills with a pale tint of each for the area under a line.

Rules that come with the exception:

- **Admin only.** They are defined under `.admin-shell` and no public page can
  reach them. Nothing outside the Admin Portal may use them.
- **Ordered by lightness, not hue.** Neighbouring series alternate dark and
  light so a chart survives greyscale and the colour-vision filters. Picking
  by hue would put teal next to green and lose both.
- **Colour is never the only signal.** Every series has a label in the key and
  its own row in the `ChartTable` underneath. Every KPI change carries an arrow
  and a sign as well as a colour, and up is not always good (open reports going
  up is bad), so the card says what the direction means.
- **Every mark has an edge.** Orange is 2.14:1 on white and amber and sky are
  fainter, so bars, swatches and ring segments are drawn with
  `--admin-mark-edge`. The edge makes the mark findable; the fill only tells it
  apart from its neighbours.
- **Four themes.** Light, dark, high contrast and dark-high-contrast each have
  their own values. `npm run check:palette` measures every adjacent gap and
  every edge, in all four, and fails if one drifts too close.

## Conventions

- Django apps are lowercase: accounts, content, interest, chatbot, providers, community.
- Pages go in `frontend/src/pages/`, shared parts in `frontend/src/components/`.
- Page words go in content files (like `aboutContent.js`), and interface text goes in `frontend/src/i18n/messages/en.js`. Components use `t("key")`.
- Colours and shared classes (`.label`, `.section-intro`, `.button`) live in `styles.css`. A page's own CSS only styles its own classes, because Vite bundles all the CSS together. Always use the colour variables, never a hex value.
- Branches: `feat/<thing>` or `fix/<thing>`. Nothing goes straight to `main`.
- Never commit secrets, `.env` files or `*.pem` keys.
- Keep comments short so a teammate (or a marker) can follow the code.

## Accessibility settings

The settings on `/accessibility` are stored by `AccessibilityPreferencesProvider` (`frontend/src/hooks/useAccessibilityPreferences.jsx`). It puts flags on `<html>` and `<body>` and `styles.css` reads them:

| Setting | Flag |
| --- | --- |
| Font size, text spacing | `--font-scale`, `--text-spacing` on `<html>` |
| High contrast | `body.high-contrast`, with its own colour values for each theme (never `var(--blue)` or `var(--paper)`, they swap in dark mode) |
| Theme | `html.dark-mode` or `html.light-mode` |
| Page background, focus outline | `body[data-page-background]`, `body[data-outline-style]` |
| Reduce motion | `html[data-motion]`. Use this in CSS, not just `@media (prefers-reduced-motion)`, or the site's own setting won't work |
| Colour blindness | `html[data-colour-vision]`, using the filters in `components/ColourVisionFilters.jsx` |

Things to know:

- The colour blindness filter can't change the Amazon logo or photos.
- The filter doesn't change much on most pages, because our colours already differ in lightness. That's normal.
- Text to speech only reads Smiley's replies, not the whole page.
- The site is in 18 languages. The translations are done by machine, so every page says so and has a "Read in English" button. English is the version that counts. The staff page is English only.

## Security

- Use Django's own login and password hashing.
- Check all input on the server.
- The database is never public, and secrets go in environment variables.
- The Anthropic API key stays on the server.

## Roles

- Account types: student, parent, teacher and amazon_staff (`Profile.user_type`).
- You can't sign up as staff. Staff accounts are made by hand in Django admin.
- Only staff can see interest submissions, at `GET /api/interest/submissions/`. The check is `IsAmazonStaff` in `backend/accounts/permissions.py`.
- The `/staff` page is only linked for staff, but the API permission is what actually protects the data.

### Admin Portal rules

- Every portal endpoint is `IsAmazonStaffAndUnlocked`: staff sign-in AND the
  PIN. The PIN is a screen-lock, never the access control.
- **Nothing in the portal hands out an email address for an account.** The
  People table, its drawer and its CSV export all leave it out; most people
  here are 16 to 18 and the rule is to hold and show the minimum. Search may
  MATCH on an address, because narrowing a list is not publishing one.
  Feedback and Interest DO show emails, because in both cases the person left
  the address to be replied to.
- Staff are never made or unmade by an ordinary action. The role control moves
  people between student, parent and teacher only; taking admin access away is
  its own deliberate step, and granting it stays in Django admin. An endpoint
  inside the portal that could grant staff would make the portal's gate
  pointless.
- Everything staff do is written to `AdminAuditLog` by `record()`, one entry
  per item even in a bulk action, because a batch entry with a list of ids in
  it is invisible when somebody later filters by the account they are after.
- Destructive actions need the thing typed back: a username for one account,
  the count for a batch ("DELETE 12 POSTS"). Reversible ones do not.
- Exports honour the current filters, send every row, stream, open with a BOM
  and escape cells starting with = + - @ so a username cannot run as a formula.

## Who did what

- Amir: framework for the whole site (routing, layout, accounts, models, settings) and the Railway preview
- Aaron: Smiley (`frontend/src/assistant/`, `backend/chatbot/`)
- Micha: About, Help and T-Levels at Amazon pages, and accessibility
- Jakub: sign up and log in pages
- Lloyd: Find T-Levels Near You page
