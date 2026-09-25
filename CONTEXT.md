# T-SMILE: project context

> Paste this into Claude at the start of each coding session so everyone's AI output matches. Update it when we change a decision.

## What we're building

One website for the Amazon Emerging Talent Digital T-Level project. It explains T-Levels (in general and at Amazon), has a resources library, takes Expressions of Interest, and has Smiley, a chat helper for T-Level questions.

Who it's for: students (16 to 18), parents and guardians, teachers and schools, and Amazon staff (who read the interest submissions and manage content).

## Tech stack (don't change without asking the team)

- Backend: Python 3.11, Django 5.2, Django REST Framework (API under `/api/`)
- Frontend: React 19, React Router, Vite
- AI: Anthropic API, only called from the backend (`backend/chatbot/`)
- Database: SQLite locally, PostgreSQL on Railway and in production
- Hosting: Railway for the preview (see DEPLOYMENT.md), AWS in the UK/EU for the final version
- GitHub with branches and pull requests, CI runs on every pull request

## Design rules

- Colours: Amazon Orange #FF9900 and Amazon Dark Blue #232F3E on off-white #FAFAF7. No purple, no gradients.
- Square buttons with a small radius, no pill shapes. SVG line icons, no emoji.
- Write "T-Level" and "T-Levels" with a hyphen. Only exception: the exact title of a source we cite.
- No em dashes. No filler text. No fake reviews, numbers or accounts.
- Keep the words short and to the point.
- Bold headings, monospace for small labels.
- Any animation has to stop with reduced motion.
- Aim for WCAG 2.2 AA.
- Orange is too faint for text (about 2:1), so only use it for decoration and fills. Text, focus rings and selected states are dark blue.

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
- The site is in 10 languages. The translations are done by machine, so every page says so and has a "Read in English" button. English is the version that counts. The staff page is English only.

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

## Who did what

- Amir: framework for the whole site (routing, layout, accounts, models, settings) and the Railway preview
- Aaron: Smiley (`frontend/src/assistant/`, `backend/chatbot/`)
- Micha: About, Help and T-Levels at Amazon pages, and accessibility
- Jakub: sign up and log in pages
- Lloyd: Find T-Levels Near You page
