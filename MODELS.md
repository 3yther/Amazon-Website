# T-SMILE database

We agreed this as a team before building features. Only change a model if the team agrees, and update this file in the same pull request. Last checked against the code on 25 September 2026.

## accounts

**User** is Django's built-in user (username, email, hashed password). Don't rebuild it.

**Profile** (one per User)
- user_type: student, parent, teacher or amazon_staff
- pathway_interest: Digital, Business, Media, Finance or Engineering (optional)
- phone (optional)
- is_deactivated, deactivated_at
- last_password_changed
- created_at

**UserPreference** (one per User, the settings on the Accessibility page)
- font_size_scale: 80 to 150 (default 100)
- high_contrast, text_to_speech, reduce_motion: true/false
- text_spacing_level: 0 to 3
- color_blindness_type: none, protanopia, deuteranopia or tritanopia
- theme: light, dark or system
- button_outline_style, page_background
- language (default "en")
- date_format, number_format: not used any more (the site is always UK format), kept until the team agrees to drop them
- created_at, updated_at

**Feedback** (from the Feedback, Contact and Report an issue pages)
- category: bug, feature, general or accessibility
- message
- email (optional)
- user (optional, set if they were signed in)
- created_at

## content

**Pathway**
- name: Digital, Business, Media, Finance or Engineering
- slug, summary, description

Loaded from `backend/content/fixtures/pathways.json`.

**ContentItem** (a resource in the library)
- title, slug, description
- content_type: guide, document, video, prep_pack or class_pack
- access_level: free or signup
- pathway (empty means all pathways)
- audience: all, student, parent or teacher
- file (an upload) or link (another website)
- created_at

Starter resources are in `backend/content/fixtures/resources.json`.

## providers

**Provider** (a school or college that runs T-Levels)
- name, address, postcode
- latitude, longitude (0, 0 means not looked up yet)
- website_url (optional)
- pathways (many to many)
- created_at

Loaded from `backend/providers/fixtures/providers.json`. `python manage.py geocode_providers` fills in the positions from postcodes.io.

## interest

**ExpressionOfInterest**
- full_name, email
- user_type: student, parent or teacher
- pathway
- message (optional)
- user (optional, set if they were signed in)
- submitted_at

## chatbot

**ChatMessage**
- session_id (groups one conversation)
- user (optional)
- role: user or assistant
- message
- created_at

## community

**Question**
- author, title, body
- topic: tlevels, placements, amazon, choosing, study or other
- pathway (optional)
- hidden, hidden_reason
- created_at

**Answer**
- author, question, body
- is_accepted (the asker marked it as the answer that helped)
- hidden, hidden_reason
- created_at

**Helpful** (someone marking a question or answer helpful)
- user, question or answer, created_at

**Report** (someone flagging a question or answer)
- reporter, question or answer
- reason: personal, unkind, unsafe, wrong, spam or other
- note (optional)
- resolved (ticked by staff)
- created_at

## What happens when something is deleted

- Deleting a user deletes their Profile, UserPreference, chat messages and Community posts.
- Their Expressions of Interest and feedback are kept, but unlinked from them.
- A Pathway can't be deleted while resources or interest submissions use it.
- Deleting a Pathway only unlinks Community questions and providers from it.

## Notes

- Files go in S3 in production, and the database only stores the link.
- Keep personal data to a minimum, because most users are under 18.
