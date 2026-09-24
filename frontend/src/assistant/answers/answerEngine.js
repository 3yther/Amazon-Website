import { normalise, scoreTopic, termList, wordCount } from "./match.js";
import { checkSafety } from "./safety.js";
import { POPULAR, TOPICS, TOPICS_BY_ID, topicChip } from "./topics.js";

// Smiley's answer engine: how it replies without the AI.
//
// In order:
//   1. SAFETY  wellbeing worries and personal details. Answered here, never
//              sent to the server, whatever else the message says.
//   2. TOPICS  facts from the site's own copy, small talk and easter eggs.
//              A confident match is answered straight away: instant, free,
//              and word for word what the pages say.
//   3. AI      only for what is left, and only if the site has a key.
//   4. HONEST  if all of that fails: "I don't know that one yet", with the
//              questions Smiley can answer as chips.
//
// ctx: { t, about, amazon, help, language, now } (see useSmileyContext)

const RELATED_CHIPS = 3;

/** Words for a topic in the visitor's language, from smiley.keywords. */
function translatedTerms(ctx, id) {
  if (ctx.language === "en") return [];
  const key = `smiley.keywords.${id}`;
  const value = ctx.t(key);
  return value === key ? [] : termList(value);
}

/** The reply for one topic, with its related questions as chips. */
export function answerTopic(id, ctx) {
  const topic = TOPICS_BY_ID.get(id);
  if (!topic) return null;
  const reply = topic.reply(ctx);
  const related = (topic.related ?? [])
    .filter((relatedId) => relatedId !== id && TOPICS_BY_ID.has(relatedId))
    .slice(0, RELATED_CHIPS)
    .map((relatedId) => topicChip(ctx.t, relatedId));

  return {
    id,
    kind: topic.kind,
    text: reply.text,
    chips: [...(reply.chips ?? []), ...related],
    mood: reply.mood ?? (topic.kind === "fact" ? "happy" : undefined),
    motion: reply.motion,
  };
}

/** What Smiley says when it has nothing checked to go on. */
export function dontKnow(ctx) {
  return {
    id: "dontKnow",
    kind: "gap",
    text: ctx.t("smiley.answers.dontKnow"),
    chips: [
      ...POPULAR.slice(0, 4).map((id) => topicChip(ctx.t, id)),
      { label: ctx.t("smiley.links.askCommunity"), action: { type: "link", to: "/community" } },
    ],
    mood: "thinking",
  };
}

/**
 * Replies to a typed message, or returns null when the AI should take it.
 *
 * The result has confident: true when Smiley is sure enough to answer
 * without the AI. A result with confident: false is its best guess, used
 * only if the AI cannot be reached.
 */
export function answerLocally(text, ctx) {
  const safety = checkSafety(text);
  if (safety) {
    return {
      id: `safety-${safety.topic}`,
      kind: "safety",
      text: ctx.t(`smiley.safety.${safety.topic}`),
      chips: [],
      mood: "sympathetic",
      confident: true,
      // Never sent to the server or stored.
      private: true,
    };
  }

  const clean = normalise(text);
  if (!clean) return null;
  const words = wordCount(clean);

  let best = null;
  for (const topic of TOPICS) {
    if (topic.maxWords && words > topic.maxWords) continue;
    const score = scoreTopic(clean, topic, translatedTerms(ctx, topic.id));
    if (score > (best?.score ?? 0)) best = { topic, score };
  }
  if (!best) return null;

  // Two word groups matched, a word from the visitor's own language matched,
  // or a very short message ("placement pay?") hit one group: sure enough.
  const confident = best.score >= 1.5 || (best.score >= 1 && words <= 4);

  return { ...answerTopic(best.topic.id, ctx), confident, score: best.score };
}
