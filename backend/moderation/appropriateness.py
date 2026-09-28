"""
Is this piece of writing appropriate for the site?

Two passes, because they fail in opposite directions and cover each other:

  1. better-profanity, a wordlist. Exact, cheap, and it generates the obvious
     character substitutions itself, so "b1tch" is caught. It cannot see
     anything that is unpleasant without containing a listed word.
  2. alt-profanity-check, a trained classifier. It scores the whole sentence,
     so it catches "shut up you absolute moron nobody cares what you think",
     which contains no swear word at all. It is probabilistic, and it misses
     blunt words buried in otherwise-clean text.

Measured on a sample of this site's own writing (real questions, names,
feedback) against obviously unacceptable text, the two are genuinely
complementary: "b1tch please" scores 0.036 from the classifier and is caught
only by the wordlist, while "shut up you absolute moron..." scores 0.999 and
is caught only by the classifier.

Flagged text is REJECTED, not quietly censored and not published-then-hidden.
So a false positive blocks a real 16-to-18 year old from asking a real
question, which is the expensive mistake here. That is what the threshold
below is chosen around.

This is not community/moderation.py, which stops a Community post for sharing
personal details or linking off-site. That one is about what a post reveals;
this one is about the language itself, and it is used on five fields across
four apps.
"""
import logging

from django.core.exceptions import ImproperlyConfigured, ValidationError

logger = logging.getLogger(__name__)

# One message, everywhere, so five callers cannot drift into five wordings.
# It is English on purpose: the front end matches it in
# frontend/src/i18n/serverMessages.js and shows the visitor's own language.
# TEAM: reword this and you must reword it there too, or it shows in English
# in all ten languages.
INAPPROPRIATE_MESSAGE = "This contains language that isn't appropriate for the site."

# WHY 0.8 AND NOT 0.5.
#
# alt-profanity-check's README documents no recommended operating point (it
# reports 95% accuracy and F1 0.88 overall, and nothing per-threshold), so this
# was measured rather than guessed. Scored against a sample of this site's own
# content, the classifier turns out to be strongly bimodal: legitimate writing
# topped out at 0.380 ("Is the bursary means tested? My mum is on universal
# credit"), and unacceptable text either scored above 0.92 or below 0.04, with
# nothing in between.
#
# So every threshold from 0.5 to 0.9 caught exactly the same things. 0.8 is
# chosen for the margin, not the recall: it sits 0.42 above the highest-scoring
# legitimate sentence instead of 0.12, and costs nothing to catch. At 0.95
# recall does start to drop.
#
# Re-measure this if the classifier is ever upgraded.
CLASSIFIER_THRESHOLD = 0.8

# Below this there is nothing for a sentence classifier to read. The wordlist
# still runs, and it is exact, so short input is checked either way.
#
# Deliberately tiny: the obvious move is to skip the classifier on anything
# short, but the shortest field here is the username, which is public on every
# post the person writes. A generous cutoff would have left exactly the field
# that most needs checking unchecked. The README gives no minimum-length
# guidance, and short legitimate input ("ada", "ok", "sam2010") measured below
# 0.05, so there was no evidence for a bigger cutoff.
MIN_CLASSIFIER_CHARS = 3

# UK words the wordlist ships without. Taken from the list Community was
# already keeping by hand in community/moderation.py, so consolidating on this
# function loses nothing it used to catch.
EXTRA_WORDS = [
    "bollocks",
    "bollock",
    "slag",
    "prick",
    "pricks",
    "piss off",
    "pissed off",
    "wanker",
    "wankers",
    "twat",
    "twats",
    "minger",
    "munter",
    "gobshite",
    "knobhead",
    "nonce",
]

# A username is one run-together word, and so is a first name. Both a
# word-boundary wordlist and a sentence classifier are nearly blind to that:
# "fuckthissite" is not a listed word and is not a sentence, so it sailed
# through both until this was added.
#
# So for input with no spaces in it, these are looked for ANYWHERE inside the
# string. Every one is a word with no innocent English containment, which is
# why the list is short and hand-picked rather than the whole wordlist: "ass"
# would refuse "assessment", "cock" would refuse "Cockermouth", and "dick"
# would refuse a real surname. Those stay word-boundary-only above.
JOINED_WORDS = [
    "fuck",
    "shit",
    "bitch",
    "bastard",
    "wank",
    "bollock",
    "twat",
    "slut",
    "whore",
    "arsehole",
    "dickhead",
    "bellend",
    "piss",
    "cunt",
]

# The Scunthorpe problem, by name. These contain one of the words above and
# are ordinary things a person might genuinely put in a username.
JOINED_ALLOWED = [
    "scunthorpe",
    "penistone",
    "shiitake",
    "shitake",
]

_wordlist_ready = False


def _wordlist():
    """better-profanity's checker, with the UK additions loaded once."""
    global _wordlist_ready
    from better_profanity import profanity

    if not _wordlist_ready:
        # Generates the substituted spellings of every word, so this is done
        # once per process rather than per call.
        profanity.load_censor_words()
        profanity.add_censor_words(EXTRA_WORDS)
        _wordlist_ready = True
    return profanity


def _classifier():
    """
    alt-profanity-check's predict_prob, imported on first use.

    Imported lazily because it pulls in scikit-learn, scipy and NumPy, which
    cost about a second and a half to import. Paying that on the first
    moderated submission rather than on every management command, migration
    and worker boot is the difference between a slow deploy and a slow first
    post.
    """
    try:
        from profanity_check import predict_prob
    except ImportError as error:  # pragma: no cover - a broken install
        # Loud, not quiet. Falling back to the wordlist alone here would leave
        # the site looking like it was still checking content when half the
        # check had silently gone.
        raise ImproperlyConfigured(
            "alt-profanity-check is not installed, so content cannot be checked. "
            "Install it from backend/requirements.txt."
        ) from error
    return predict_prob


def is_appropriate(text):
    """True when the text passes both checks. Blank text passes: nothing to judge."""
    cleaned = (text or "").strip()
    if not cleaned:
        return True

    if _wordlist().contains_profanity(cleaned):
        return False

    if _hides_a_word_with_no_spaces(cleaned):
        return False

    if len(cleaned) < MIN_CLASSIFIER_CHARS:
        return True

    score = float(_classifier()([cleaned])[0])
    if score >= CLASSIFIER_THRESHOLD:
        # The score is worth having in the log: it is the only way to tell a
        # confident catch from a borderline one when somebody reports that
        # their perfectly ordinary question was refused.
        logger.info("Content refused by the classifier, score %.3f.", score)
        return False

    return True


def _hides_a_word_with_no_spaces(text):
    """
    True when a single run-together word hides one of JOINED_WORDS.

    Only for input with no spaces, which in practice means a username or a
    one-word name. Running this over a sentence would refuse "I live in
    Scunthorpe", which is why it is not applied there: free text already has
    the word-boundary pass and the classifier, and both work on sentences.
    """
    if any(character.isspace() for character in text):
        return False

    # Letters only, so "f.u.c.k" and "fuck_2009" are read the same way.
    letters = "".join(character for character in text.lower() if character.isalpha())
    for allowed in JOINED_ALLOWED:
        letters = letters.replace(allowed, "")
    return any(word in letters for word in JOINED_WORDS)


def check_appropriate(text):
    """
    Raise ValidationError if the text is not appropriate for the site.

    Returns None and says nothing when it is fine, so it reads as an assertion
    at the end of a serializer's validate_<field>:

        def validate_body(self, value):
            check_appropriate(value)
            return value

    Raises django.core.exceptions.ValidationError, which DRF turns into a
    field-level error when it is raised from a validate_<field> method, so the
    message lands on the box the visitor actually needs to fix.
    """
    if not is_appropriate(text):
        raise ValidationError(INAPPROPRIATE_MESSAGE)
