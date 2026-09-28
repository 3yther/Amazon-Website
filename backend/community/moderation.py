"""Checks every Community post before it goes up.

A post is stopped for:
  wellbeing         sounds like someone is at risk (they get support numbers instead)
  personal_details  an email, phone number, postcode or social handle
  link              links to anything except a few official sites

Swearing is NOT here any more. It was a hand-kept list of eighteen words that
only Community used; it is now backend/moderation/, which every field on the
site shares, catches substituted spellings, and reads the whole sentence. The
words this list had that the shared one shipped without were carried over, so
nothing that used to be stopped is let through (see EXTRA_WORDS there, and the
test that pins it).

What is left here is the part that is genuinely about a POST rather than about
language: what it reveals, and where it points.

3 reports hide a post, and staff can hide posts in admin.
"""
import re

WELLBEING = [
    "kill myself",
    "killing myself",
    "suicide",
    "suicidal",
    "end my life",
    "want to die",
    "self harm",
    "self-harm",
    "hurt myself",
    "hurting myself",
    "cutting myself",
    "being abused",
    "abusing me",
    "not safe at home",
]

EMAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")
PHONE = re.compile(r"(\+44\s?|\b0)(\d[\s-]?){9,10}\b")
POSTCODE = re.compile(r"\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b", re.IGNORECASE)
LINK = re.compile(r"(https?://|www\.)\S+|\b[\w-]+\.(com|co\.uk|org|net|io|me|uk)\b", re.IGNORECASE)
HANDLE = re.compile(r"(^|\s)@\w{2,}")
CONTACT_PHRASES = [
    "add me on",
    "dm me",
    "message me on",
    "my snap",
    "my insta",
    "my instagram",
    "my tiktok",
    "whatsapp me",
    "text me",
    "my number is",
]


# Links are only allowed to these official sites.
ALLOWED_SITES = (
    "gov.uk",
    "ucas.com",
    "nhs.uk",
    "aboutamazon.co.uk",
    "childline.org.uk",
    "samaritans.org",
    "giveusashout.org",
)


def has_outside_link(text):
    """True if the text links anywhere other than the official sites above."""
    for match in LINK.finditer(text):
        host = re.sub(r"^(https?://)?(www\.)?", "", match.group(0).lower()).split("/")[0]
        if not any(host == site or host.endswith("." + site) for site in ALLOWED_SITES):
            return True
    return False


def check_post(*texts):
    """Returns why a post can't be published, or None if it's fine."""
    text = " ".join(part for part in texts if part)
    lower = text.lower()

    if any(phrase in lower for phrase in WELLBEING):
        return "wellbeing"

    if (
        EMAIL.search(text)
        or PHONE.search(text)
        or POSTCODE.search(text)
        or HANDLE.search(text)
        or any(phrase in lower for phrase in CONTACT_PHRASES)
    ):
        return "personal_details"

    if has_outside_link(text):
        return "link"

    return None
