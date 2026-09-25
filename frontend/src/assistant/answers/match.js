// Simple word matching for Smiley. A question matches a topic if it has a
// word from each of the topic's word groups.

// Spellings people really type, folded into one form before matching.
const SPELLINGS = [
  [/\bt[\s-]?levels?\b/g, "tlevel"],
  [/\bt\s?lvl\b/g, "tlevel"],
  [/\bapprenticeships?\b/g, "apprenticeship"],
  [/\buni\b/g, "university"],
  [/\bgcses?\b/g, "gcse"],
  [/\ba[\s-]?levels?\b/g, "alevel"],
  [/\bplacements?\b/g, "placement"],
  [/\bwork\s+experience\b/g, "placement"],
  [/\bcolleges?\b/g, "college"],
  [/\bwhats\b/g, "what is"],
  [/\bwho's\b/g, "who is"],
  [/\bu\b/g, "you"],
  [/\bur\b/g, "your"],
  [/\bpls\b|\bplz\b/g, "please"],
  [/\bthx\b|\bty\b/g, "thanks"],
];

/** Lower case, no punctuation, single spaces, common spellings folded. */
export function normalise(text) {
  let clean = ` ${String(text).toLowerCase()} `
    // Keep letters and numbers from any alphabet, drop everything else. \p{M}
    // keeps the vowel signs Bengali, Gujarati and Gurmukhi write words with.
    .replace(/[^\p{L}\p{M}\p{N}\s@.+']/gu, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ");
  for (const [pattern, replacement] of SPELLINGS) clean = clean.replace(pattern, replacement);
  return clean.trim();
}

function escape(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Short words have to match a whole word ("hi" shouldn't match "his").
// Words of 6+ letters can match the start of a word ("placement" -> "placements").
const LATIN = /^[\p{Script=Latin}\p{N}\s]+$/u;
const PREFIX_FROM = 6;
const cache = new Map();

function termPattern(term) {
  if (!cache.has(term)) {
    let source = escape(term);
    if (LATIN.test(term)) {
      source = `(^|\\s)${source}${term.length >= PREFIX_FROM ? "" : "(?=\\s|$)"}`;
    }
    cache.set(term, new RegExp(source, "u"));
  }
  return cache.get(term);
}

export function hasTerm(clean, term) {
  return termPattern(normalise(term)).test(clean);
}

export function hasAny(clean, terms) {
  return terms.some((term) => hasTerm(clean, term));
}

// Scores how well a question fits a topic. More matching word groups = higher score.
export function scoreTopic(clean, topic, extraTerms = []) {
  let score = 0;

  for (const pattern of topic.patterns ?? []) {
    if (pattern.every((group) => hasAny(clean, group))) score = Math.max(score, pattern.length);
  }

  if (score > 0 && topic.also) {
    score += topic.also.filter((term) => hasTerm(clean, term)).length * 0.5;
  }

  const hits = extraTerms.filter((term) => hasTerm(clean, term)).length;
  if (hits > 0) score = Math.max(score, 0.75 + hits * 0.5);

  return score;
}

export function wordCount(clean) {
  return clean ? clean.split(" ").length : 0;
}

/** Splits "a, b, c" from a translation file into ["a", "b", "c"]. */
export function termList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}
