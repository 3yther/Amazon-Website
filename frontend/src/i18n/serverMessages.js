// Messages the Django API sends in English, matched to their translations
// under serverErrors in the language files. api.js also asks Django for the
// visitor's language, and Django's LocaleMiddleware answers in it where
// Django and DRF have their own words (see MIDDLEWARE in config/settings.py).
// They do not have them for every language, so the common built-in messages
// are listed here as well: whichever way a message arrives, it is translated.
//
// TEAM: if you add or reword a message in the backend, add it here too, or
// it will show in English on every language.

const EXACT = {
  // Django and DRF
  "This field is required.": "requiredField",
  "This field may not be blank.": "blankField",
  "This password is too common.": "passwordCommon",
  "This password is entirely numeric.": "passwordNumeric",
  "The password is too similar to the username.": "passwordSimilar",
  "Enter a valid email address.": "invalidEmail",
  // Ours
  "A user with that username already exists.": "usernameTaken",
  "Invalid username or password.": "invalidCredentials",
  "Current password is incorrect.": "wrongCurrentPassword",
  "Incorrect password.": "wrongPassword",
  "Passwords do not match.": "passwordsDontMatch",
  "This password reset link is invalid or has expired. Request a new one.": "resetLinkInvalid",
  "Choose a valid pathway.": "choosePathway",
  "Use letters, spaces, hyphens or apostrophes only.": "nameCharacters",
  "Write an answer first.": "writeAnswer",
  "Make the question a little longer so people know what you mean.": "questionTooShort",
  "You can only delete your own question.": "deleteOwn",
  "This question is waiting for a staff review.": "awaitingReview",
  "Only the person who asked can mark the answer that helped.": "onlyAsker",
  "Type a question first.": "typeQuestion",
  "Enter a postcode.": "enterPostcode",
  "The postcode lookup service is unavailable right now. Please try again shortly.": "postcodeServiceDown",
};

// Messages with a value inside them: the pattern pulls the value out, and it
// goes back into the translation as a {placeholder}.
const PATTERNS = [
  [/^This password is too short\. It must contain at least (\d+) characters?\.$/, "passwordTooShort", ["min"]],
  [/^Ensure this field has no more than (\d+) characters\.$/, "tooLong", ["max"]],
  [/^"(.+)" is not a valid choice\.$/, "invalidChoice", ["value"]],
  [/^We could not find the postcode "(.+)"\. Check it and try again\.$/, "postcodeNotFound", ["postcode"]],
  [/^Choose a distance between 1 and (\d+) miles\.$/, "chooseDistance", ["max"]],
  [/^Unknown pathway "(.+)"\.$/, "unknownPathway", ["pathway"]],
  [/^Choose one of: (.+)\.$/, "chooseOneOf", ["choices"]],
];

/** One message from the API, in the visitor's language when we know it. Anything else comes back as it was. */
export function translateServerMessage(message, t) {
  if (typeof message !== "string") return message;
  if (EXACT[message]) return t(`serverErrors.${EXACT[message]}`);
  for (const [pattern, id, names] of PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const values = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
      return t(`serverErrors.${id}`, values);
    }
  }
  return message;
}

/** Examples of every message above, for the tests. */
export const SERVER_MESSAGE_EXAMPLES = [
  ...Object.keys(EXACT),
  "This password is too short. It must contain at least 8 characters.",
  "Ensure this field has no more than 100 characters.",
  "\"teacherz\" is not a valid choice.",
  "We could not find the postcode \"ZZ99 9ZZ\". Check it and try again.",
  "Choose a distance between 1 and 100 miles.",
  "Unknown pathway \"cooking\".",
  "Choose one of: student, parent, teacher.",
];
