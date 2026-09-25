import { hasAny, normalise } from "./match.js";

// Safeguarding comes before everything else Smiley does. Most visitors are 16
// to 18, so:
//
// 1. Anything that sounds like somebody at risk gets calm, clear signposting
//    to people who can actually help, and no jokes, whatever else it says.
// 2. Personal details (an email, a phone number, a postcode) get a gentle
//    "you don't need to share that".
//
// Messages caught here are answered in the browser and are NEVER sent to the
// server or stored. The support numbers were checked against each service's
// own website in September 2026:
//   Childline 0800 1111, free, 24/7, not on the phone bill (childline.org.uk)
//   Shout, text SHOUT to 85258, free, 24/7 (giveusashout.org)
//   Samaritans 116 123, free, 24/7 (samaritans.org)
//   999 in an emergency
//
// The word lists are deliberately broad: a false alarm costs somebody one
// kind message; a miss could cost much more.

const AT_RISK = [
  "kill myself",
  "killing myself",
  "suicide",
  "suicidal",
  "end my life",
  "want to die",
  "wanna die",
  "don't want to be here",
  "dont want to be here",
  "better off dead",
  "self harm",
  "self-harm",
  "selfharm",
  "hurt myself",
  "hurting myself",
  "cutting myself",
  "cut myself",
  "overdose",
];

const HARMED = [
  "being bullied",
  "getting bullied",
  "bullying me",
  "bully me",
  "bullies",
  "abuse",
  "abused",
  "abusing",
  "hurting me",
  "hits me",
  "touched me",
  "touching me",
  "unsafe at home",
  "not safe",
  "scared to go home",
  "groomed",
  "grooming",
  "threatening me",
  "blackmail",
];

const STRUGGLING = [
  "depressed",
  "depression",
  "anxious",
  "anxiety",
  "panic attack",
  "so stressed",
  "really stressed",
  "cant cope",
  "can't cope",
  "overwhelmed",
  "lonely",
  "hopeless",
  "nobody cares",
  "no one cares",
];

// Personal details, matched on the raw text (before punctuation is removed).
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
// UK phone numbers in the common shapes: 07700 900123, +44 7700 900123,
// 020 7946 0000. Eleven digits give or take spaces, starting 0 or +44.
const PHONE = /(\+44\s?|\b0)(\d[\s-]?){9,10}\b/;
// UK postcodes, e.g. SW1A 1AA, M1 1AE.
const POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i;
const ADDRESS_WORDS = ["my address is", "i live at", "my house is", "my school is"];

/**
 * Checks a message for safeguarding concerns and personal details.
 * Returns { topic, private: true } or null. Always private: never sent on.
 */
export function checkSafety(raw) {
  const clean = normalise(raw);

  if (hasAny(clean, AT_RISK)) return { topic: "atRisk" };
  if (hasAny(clean, HARMED)) return { topic: "harmed" };
  if (hasAny(clean, STRUGGLING)) return { topic: "struggling" };

  if (EMAIL.test(raw) || PHONE.test(raw) || POSTCODE.test(raw) || hasAny(clean, ADDRESS_WORDS)) {
    return { topic: "personal" };
  }

  return null;
}
