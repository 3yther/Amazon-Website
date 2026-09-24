# T-SMILE: Database Schema

> Agreed as a team before features were built. Everything depends on it.
> Change a model only by team agreement, because it breaks other people's work,
> and update this file in the same pull request.
> This maps to the ERD in the proposal. Last checked against the code: 23 September 2026.

## Core models (Django)

### User  (Django's built-in auth User, extended with Profile and UserPreference)
Django gives you username, email, password (salted and hashed), etc. for free. Do not rebuild auth.

### Profile  (`accounts` app, one-to-one with User)
- user                  -> OneToOne(User), deleted with the user
- user_type             -> choice: student | parent | teacher | amazon_staff
- pathway_interest      -> choice: Digital | Business | Media | Finance | Engineering (nullable)
- phone                 -> text (optional)
- is_deactivated        -> true/false (default false)
- deactivated_at        -> datetime (nullable)
- last_password_changed -> datetime (set at sign up, updated when the password changes)
- created_at            -> datetime (auto)

### UserPreference  (`accounts` app, one-to-one with User)
The settings on the Accessibility page, saved for signed-in users.
- user                  -> OneToOne(User), deleted with the user
- font_size_scale       -> whole number, 80 to 150 (percent, default 100)
- high_contrast         -> true/false
- text_spacing_level    -> whole number, 0 to 3
- color_blindness_type  -> choice: none | protanopia | deuteranopia | tritanopia
- text_to_speech        -> true/false
- reduce_motion         -> true/false
- theme                 -> choice: light | dark | system (default system)
- button_outline_style  -> text (default "default")
- page_background       -> text (default "white")
- language              -> text (default "en")
- date_format           -> text (default "MM/DD/YYYY")
- number_format         -> text (default "US")
- created_at, updated_at -> datetime (auto)

### Pathway  (`content` app)
- name            -> choice: Digital | Business | Media | Finance | Engineering (unique)
- slug            -> short url-safe name (unique)
- summary         -> short text (up to 255 characters)
- description     -> long text
The five rows are loaded from `backend/content/fixtures/pathways.json`.
The starter resources (ContentItems linking to official pages) load from
`backend/content/fixtures/resources.json`.

### ContentItem  (`content` app, the resources library)
- title           -> text
- slug            -> url-safe (unique)
- description     -> text
- content_type    -> choice: guide | document | video | prep_pack | class_pack
- access_level    -> choice: free | signup   (signup = gated, needs an account)
- pathway         -> ForeignKey(Pathway, nullable)  # null = applies to all
- audience        -> choice: all | student | parent | teacher
- file            -> uploaded file (nullable); local disk in development, S3 in production
- link            -> web address of a resource on another site (optional); use this or file
- created_at      -> datetime (auto)

### ExpressionOfInterest  (`interest` app)
- full_name       -> text
- email           -> email
- user_type       -> choice: student | parent | teacher
- pathway         -> ForeignKey(Pathway)
- message         -> text (optional)
- submitted_at    -> datetime (auto)
- user            -> ForeignKey(User, nullable); set when the visitor was signed in

### ChatMessage  (`chatbot` app, the AI assistant)
- session_id      -> text, groups one conversation (every visitor, signed in or not)
- user            -> ForeignKey(User, nullable); set when signed in, deleted with the user
- role            -> choice: user | assistant
- message         -> text
- created_at      -> datetime (auto)

## Relationships (the ERD in words)
- One User has one Profile and one UserPreference.
- One Pathway has many ContentItems.
- One Pathway has many ExpressionsOfInterest.
- A User may submit many ExpressionsOfInterest (or submit anonymously).
- ChatMessages belong to a session, and to a User when they are signed in.

## Delete rules (what happens when a row is removed)
- Deleting a User deletes their Profile, UserPreference and ChatMessages.
- Deleting a User keeps their ExpressionsOfInterest but unlinks them (user set to null).
- A Pathway cannot be deleted while any ContentItem or ExpressionOfInterest points at it.

## Notes
- Store FILES in S3, store the LINK to them in ContentItem.file. Do not put files in the DB.
- Keep personal data minimal (mentor: safeguarding for under-18s).
- Amazon staff view EoI submissions through Django admin to start (free, built in).
