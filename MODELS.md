# T-SMILE — Database Schema (LOCK THIS FIRST)

> Agree this as a team BEFORE anyone builds features. Everything depends on it.
> Change a model only by team agreement, because it breaks other people's work.
> This maps to the ERD in the proposal.

## Core models (Django)

### User  (use Django's built-in auth User, extended with a Profile)
Django gives you username, email, password (hashed), etc. for free. Do not rebuild auth.

### Profile  (one-to-one with User)
- user            -> OneToOne(User)
- user_type       -> choice: student | parent | teacher | amazon_staff
- pathway_interest-> choice: Digital | Business | Media | Finance | Engineering (nullable)
- created_at      -> datetime (auto)

### Pathway
- name            -> choice/text: Digital | Business | Media | Finance | Engineering
- slug            -> short url-safe name
- summary         -> short text
- description     -> long text

### ContentItem   (the resources library)
- title           -> text
- slug            -> url-safe
- description     -> text
- content_type    -> choice: guide | document | video | prep_pack | class_pack
- access_level    -> choice: free | signup   (signup = gated, needs an account)
- pathway         -> ForeignKey(Pathway, nullable)  # null = applies to all
- audience        -> choice: all | student | parent | teacher
- file            -> file/URL to the asset in S3 (nullable)
- created_at      -> datetime (auto)

### ExpressionOfInterest
- full_name       -> text
- email           -> email
- user_type       -> choice: student | parent | teacher
- pathway         -> ForeignKey(Pathway)
- message         -> text (optional)
- submitted_at    -> datetime (auto)
- (link to User if logged in, nullable)

### ChatMessage   (for the AI chatbot / Task 4, optional to start)
- session_id      -> text (or ForeignKey User if logged in)
- role            -> choice: user | assistant
- message         -> text
- created_at      -> datetime (auto)

## Relationships (the ERD in words)
- One User has one Profile.
- One Pathway has many ContentItems.
- One Pathway has many ExpressionsOfInterest.
- A User may submit many ExpressionsOfInterest (or submit anonymously).
- ChatMessages belong to a session or a User.

## Notes
- Store FILES in S3, store the LINK to them in ContentItem.file. Do not put files in the DB.
- Keep personal data minimal (mentor: safeguarding for under-18s).
- Amazon staff view EoI submissions through Django admin to start (free, built in).
