import { hasAny, normalise } from "./match.js";

// Safety checks come first because most visitors are 16 to 18.
// Worrying messages get support numbers, and personal details get a warning.
// These messages are never sent to the server.
// Numbers checked September 2026: Childline 0800 1111, Shout 85258,
// Samaritans 116 123, 999 in an emergency.

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

// Checks a message for safety worries or personal details.
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
