// The things Smiley says by itself: greetings, questions, suggestion chips and nudges.
// The words are in i18n/messages under "smiley".
// Chip types: topic, ask, audience, local, link, quiz, retry.

import { topicChip } from "./answers/topics.js";

/** A time-of-day hello, by the visitor's own clock. */
export function greetingFor(t, date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return t("smiley.greetings.morning");
  if (hour >= 12 && hour < 17) return t("smiley.greetings.afternoon");
  if (hour >= 17 && hour < 23) return t("smiley.greetings.evening");
  return t("smiley.greetings.lateNight");
}

/** True between 11pm and 5am, when Smiley reminds people to rest. */
export function isLateNight(date = new Date()) {
  const hour = date.getHours();
  return hour >= 23 || hour < 5;
}

export function audienceChips(t) {
  return ["student", "parent", "teacher"].map((value) => ({
    label: t(`smiley.audience.${value}`),
    action: { type: "audience", value },
  }));
}

const AUDIENCE_TOPICS = {
  student: ["pathway-digital", "pathway-business", "pathway-media", "pathway-finance", "pathway-engineering"],
  parent: ["placementHow", "tlevelCost", "tlevelVsApprenticeship"],
  teacher: ["resources", "tlevelAssessment", "amazonPlacement"],
};

/** What Smiley says after it knows who it's talking to. */
export function audienceReply(t, audience, { opener = true } = {}) {
  const who = AUDIENCE_TOPICS[audience] ? audience : "student";
  const text = t(`smiley.audience.replies.${who}.text`);
  const chips = AUDIENCE_TOPICS[who].map((id) => topicChip(t, id));
  if (who === "student") {
    chips.push({ label: t("smiley.audience.notSure"), action: { type: "local", key: "unsure" } });
  }
  return {
    text: opener ? `${t(`smiley.audience.replies.${who}.opener`)} ${text}` : text,
    chips,
  };
}

/** The hello and first question for a brand new conversation. */
export function introMessages(t, audience, date = new Date()) {
  const hello = { text: `${greetingFor(t, date)} ${t("smiley.intro")}` };
  const follow = audience
    ? audienceReply(t, audience, { opener: false })
    : { text: t("smiley.whoQuestion"), chips: audienceChips(t) };
  return [hello, follow];
}

/** Replies Smiley gives without asking anyone. */
export function localReply(t, key) {
  if (key === "unsure") {
    return {
      text: t("smiley.audience.notSureReply"),
      chips: [
        { label: t("smiley.links.quiz"), action: { type: "link", to: "/quiz" } },
        topicChip(t, "pathwaysList"),
      ],
    };
  }
  return null;
}

/** Offered under an AI answer. Only the AI can simplify its own answer. */
export function afterAiChips(t) {
  return [
    { label: t("smiley.afterAi.simpler"), action: { type: "ask", text: t("smiley.afterAi.simplerAsk") } },
    { label: t("smiley.afterAi.more"), action: { type: "ask", text: t("smiley.afterAi.moreAsk") } },
  ];
}

/** When the AI cannot be reached: try again, or somewhere else to go. */
export function fallbackChips(t) {
  return [
    { label: t("smiley.retry"), action: { type: "retry" } },
    { label: t("smiley.links.help"), action: { type: "link", to: "/help" } },
    { label: t("smiley.links.resources"), action: { type: "link", to: "/resources" } },
  ];
}

/** What Smiley says when somebody gets a quiz question wrong. */
export function quizNudge(t, question) {
  return {
    text: t("smiley.quizNudge", { question }),
    chips: [
      { label: t("smiley.quizExplain"), action: { type: "quiz", mode: "explain" } },
      { label: t("smiley.quizWhyWrong"), action: { type: "quiz", mode: "whyWrong" } },
    ],
  };
}

/** Explains a quiz question using the quiz's own answer, no AI needed. */
export function quizExplanation(t, quiz) {
  const values = {
    question: quiz.question,
    correct: quiz.correctAnswer,
    chosen: quiz.chosenAnswer,
    explanation: quiz.explanation ?? "",
  };
  return quiz.chosenAnswer ? t("smiley.quizLocalChosen", values) : t("smiley.quizLocal", values);
}

// What Smiley says when a page has gone quiet, different for each page.
const NUDGES = {
  "/": ["home", ["whatIsTLevel", "amazonPlacement"]],
  "/about": ["about", ["placementLength", "tlevelVsApprenticeship"]],
  "/t-levels-at-amazon": ["amazon", ["amazonSupport", "amazonPathways"]],
  "/resources": ["resources", ["account"]],
  "/t-level-near-you": ["nearYou", ["entryRequirements", "providerQuestions"]],
  "/quiz": ["quiz", []],
  "/help": ["help", ["registerInterest", "careersAdvice"]],
  "/community": ["community", ["whatIsTLevel", "placementLength"]],
  "/register": ["register", ["account"]],
};

/** The nudge for a page, by route. */
export function nudgeForPath(t, pathname) {
  const [key, topics] = NUDGES[pathname] ?? ["other", ["whatIsTLevel", "amazonPlacement"]];
  return { text: t(`smiley.nudges.${key}`), chips: topics.map((id) => topicChip(t, id)) };
}
