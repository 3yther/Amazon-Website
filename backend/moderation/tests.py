"""
The appropriateness check on its own, before it is wired into five serializers.

This is the one place where a false positive or a false negative actually
costs something: flagged text is refused outright, so a wrong "no" stops a
real student asking a real question. Worth testing away from the serializers
that call it.
"""
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from moderation import check_appropriate
from moderation.appropriateness import (
    CLASSIFIER_THRESHOLD,
    INAPPROPRIATE_MESSAGE,
    is_appropriate,
)

# Real writing this site sees: questions, feedback, names, usernames.
CLEAN = [
    "How long is the industry placement on a Digital T-Level?",
    "Does Amazon take T-Level students from outside London?",
    "My daughter is looking at Engineering, what GCSEs does she need?",
    "Is the bursary means tested? My mum is on universal credit.",
    "I found the site really useful, thanks. The pathway pages are clear.",
    "The assessment for the Health T-Level includes an employer-set project.",
    "Ada Lovelace",
    "Jean-Luc O'Brien",
    "adalovelace",
    "sam2010",
]

# Criticism is not profanity. The site is for teenagers talking about a course
# they might hate, and saying so has to stay allowed.
BLUNT_BUT_ALLOWED = [
    "I hated the maths bit, it was awful and really badly taught.",
    "This is rubbish, the website kept crashing when I tried to sign up.",
    "Honestly the placement was boring and I learned nothing useful.",
    "My teacher said the Digital pathway is dying, is that true?",
]


class CheckAppropriateTests(SimpleTestCase):
    def test_obvious_profanity_is_refused(self):
        for text in ["fuck this stupid website", "what the hell is this shit"]:
            with self.subTest(text=text):
                with self.assertRaises(ValidationError):
                    check_appropriate(text)

    def test_ordinary_writing_passes(self):
        for text in CLEAN:
            with self.subTest(text=text):
                check_appropriate(text)  # must not raise

    def test_being_rude_about_the_course_is_not_the_same_as_swearing(self):
        for text in BLUNT_BUT_ALLOWED:
            with self.subTest(text=text):
                check_appropriate(text)

    def test_blank_input_passes(self):
        for text in ["", "   ", "\t\n", None]:
            with self.subTest(text=repr(text)):
                check_appropriate(text)

    def test_the_message_is_the_same_whatever_tripped_it(self):
        """Five callers, one wording, matched by name in serverMessages.js."""
        for text in ["fuck this", "shut up you absolute moron nobody cares"]:
            with self.subTest(text=text):
                with self.assertRaises(ValidationError) as caught:
                    check_appropriate(text)
                self.assertEqual(caught.exception.messages, [INAPPROPRIATE_MESSAGE])


class TheTwoChecksCoverEachOtherTests(SimpleTestCase):
    """
    The reason for running both. Each of these is caught by one pass and
    missed by the other, which is the whole argument for the pair.
    """

    def test_the_wordlist_catches_what_the_classifier_misses(self):
        # Substituted spelling. The classifier scored this 0.036, far below
        # any usable threshold; the wordlist generates the variant itself.
        text = "b1tch please"

        self.assertLess(self._score(text), CLASSIFIER_THRESHOLD)
        self.assertFalse(is_appropriate(text))

    def test_the_classifier_catches_what_the_wordlist_misses(self):
        # Not a swear word in sight, and unpleasant enough to refuse.
        from moderation.appropriateness import _wordlist

        text = "shut up you absolute moron nobody cares what you think"

        self.assertFalse(_wordlist().contains_profanity(text))
        self.assertFalse(is_appropriate(text))

    def test_uk_words_the_shipped_wordlist_leaves_out_are_added_back(self):
        # Taken from the list Community kept by hand before this existed, so
        # consolidating on one function loses nothing it used to catch.
        from moderation.appropriateness import _wordlist

        for word in ["bollocks", "slag", "prick", "piss off"]:
            with self.subTest(word=word):
                self.assertTrue(_wordlist().contains_profanity(f"you {word}"))

    @staticmethod
    def _score(text):
        from moderation.appropriateness import _classifier

        return float(_classifier()([text])[0])


class ShortInputTests(SimpleTestCase):
    """
    The username is the shortest field that gets checked, and the most public,
    so it must not fall through a "too short to judge" hole.
    """

    def test_a_short_username_is_still_checked_by_the_wordlist(self):
        self.assertFalse(is_appropriate("fuck"))

    def test_ordinary_short_input_passes(self):
        for text in ["no", "ok", "hi", "ada", "jo", "a"]:
            with self.subTest(text=text):
                check_appropriate(text)


class RunTogetherWordTests(SimpleTestCase):
    """
    A username is one word with no spaces, which both passes are nearly blind
    to: it is not a listed word and it is not a sentence. "fuckthissite"
    registered cleanly until this was handled.
    """

    def test_a_word_hidden_in_a_username_is_found(self):
        for username in ["fuckthissite", "fuckface", "totalbellend", "xXbitchXx", "fuck_2009"]:
            with self.subTest(username=username):
                self.assertFalse(is_appropriate(username))

    def test_punctuation_between_the_letters_does_not_hide_it(self):
        for username in ["f.u.c.k", "f-u-c-k", "s.h.i.t.head"]:
            with self.subTest(username=username):
                self.assertFalse(is_appropriate(username))

    def test_ordinary_usernames_are_not_touched(self):
        for username in ["adalovelace", "sam2010", "t.level.student", "jsmith", "hollybrook"]:
            with self.subTest(username=username):
                self.assertTrue(is_appropriate(username))

    def test_the_scunthorpe_problem_is_handled_by_name(self):
        """
        Real places and words that contain a rude one. Someone from
        Scunthorpe has to be able to say so in their username.
        """
        for username in ["scunthorpe", "scunthorpelad", "penistone", "shiitake"]:
            with self.subTest(username=username):
                self.assertTrue(is_appropriate(username))

    def test_words_with_innocent_containment_stay_word_boundary_only(self):
        """
        The run-together list is deliberately short. These would have been
        caught by a naive substring scan of the whole wordlist, and all five
        are ordinary things to write.
        """
        for text in ["assessment", "classanalysis", "cockermouth", "dickinson", "peacock"]:
            with self.subTest(text=text):
                self.assertTrue(is_appropriate(text))

    def test_a_sentence_mentioning_scunthorpe_is_never_run_through_it(self):
        # The run-together pass only applies to input with no spaces, so an
        # ordinary sentence keeps the word-boundary behaviour.
        self.assertTrue(is_appropriate("I live in Scunthorpe and there is no provider near me."))
