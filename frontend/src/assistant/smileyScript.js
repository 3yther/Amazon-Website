// Everything Smiley says on its own, before the AI is involved: greetings, the
// questions it asks, the suggested replies, and its nudges. Kept here, away
// from the logic, so the voice can be edited without touching any code (same
// idea as aboutContent.js).
//
// Smiley's voice: warm, upbeat, a little playful, never sarcastic. British
// English, no em dashes, no emoji (see CONTEXT.md). Short: the widget is small.
//
// Each suggested reply ("chip") has a label and an action:
//   { type: "ask", text }        sends text to Smiley as the visitor's question
//   { type: "audience", value }  answers "who's visiting?" (kept in the browser)
//   { type: "local", key }       answered from LOCAL_REPLIES below, no AI call
//   { type: "link", to }         goes to a page on this site
//   { type: "retry" }            sends the last question again

/** "Morning!", "Afternoon!" or "Evening!", by the visitor's own clock. */
export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning!";
  if (hour >= 12 && hour < 17) return "Afternoon!";
  return "Evening!";
}

export const INTRO =
  "I'm Smiley, your T Level guide. Ask me anything about T Levels or placements at " +
  "Amazon. If I don't know something, I'll tell you rather than make it up.";

export const WELCOME_BACK = "Good to see you again. Pick up where you left off, or ask me something new.";

// The first question Smiley asks. The answer stays in this browser: it is
// only used to suggest better questions and to pitch Smiley's answers.
export const WHO_QUESTION = "First things first: who's visiting today?";

export const AUDIENCE_CHIPS = [
  { label: "I'm a student", action: { type: "audience", value: "student" } },
  { label: "I'm a parent or carer", action: { type: "audience", value: "parent" } },
  { label: "I'm a teacher", action: { type: "audience", value: "teacher" } },
];

const PATHWAY_CHIPS = ["Digital", "Business", "Media", "Finance", "Engineering"].map((name) => ({
  label: name,
  action: { type: "ask", text: `What does the ${name} pathway involve?` },
}));

const AUDIENCE_REPLIES = {
  student: {
    opener: "Nice one.",
    text: "Which kind of work sounds most like you?",
    chips: [...PATHWAY_CHIPS, { label: "Not sure yet", action: { type: "local", key: "unsure" } }],
  },
  parent: {
    opener: "Great to have you here.",
    text: "What would help most?",
    chips: [
      { label: "How does the placement work?", action: { type: "ask", text: "How does the industry placement work?" } },
      { label: "Does it cost anything?", action: { type: "ask", text: "Does a T Level cost anything, and is there help with travel?" } },
      { label: "Is it like an apprenticeship?", action: { type: "ask", text: "Is a T Level the same as an apprenticeship?" } },
    ],
  },
  teacher: {
    opener: "Welcome.",
    text: "What are you after today?",
    chips: [
      { label: "Resources for my class", action: { type: "ask", text: "What resources do you have for teachers?" } },
      { label: "How are T Levels assessed?", action: { type: "ask", text: "How is a T Level assessed?" } },
      { label: "Amazon's programme", action: { type: "ask", text: "What does Amazon's placement programme involve?" } },
    ],
  },
};

/**
 * Smiley's follow-up once it knows who it is talking to. With an opener
 * ("Nice one.") straight after the visitor answers; without one when the
 * answer is remembered from earlier, where "Nice one" would reply to nothing.
 */
export function audienceReply(audience, { opener = true } = {}) {
  const reply = AUDIENCE_REPLIES[audience] ?? AUDIENCE_REPLIES.student;
  return { text: opener ? `${reply.opener} ${reply.text}` : reply.text, chips: reply.chips };
}

/** Replies Smiley can give without asking the AI. */
export const LOCAL_REPLIES = {
  unsure: {
    text:
      "Totally normal, most people start there. The quiz is a quick way to think it " +
      "through, or I can run you through the pathways.",
    chips: [
      { label: "Take the quiz", action: { type: "link", to: "/quiz" } },
      { label: "What are the pathways?", action: { type: "ask", text: "What are the five pathways?" } },
    ],
  },
};

// Offered under every answer, like a study partner would.
export const AFTER_ANSWER_CHIPS = [
  { label: "Explain that more simply", action: { type: "ask", text: "Can you explain that more simply?" } },
  { label: "What else should I know?", action: { type: "ask", text: "What else should I know about that?" } },
];

export const RETRY_CHIP = { label: "Try again", action: { type: "retry" } };

// Shown when the AI cannot be reached. Says what happened and what to do next.
export const FALLBACK_TEXT =
  "I can't answer right now. Try again in a moment, or have a look at the Help page " +
  "or the Resources page.";

/** What Smiley says when somebody gets a quiz question wrong. */
export function quizNudge(question) {
  return {
    text: `Ooh, that one catches a lot of people out. Want me to walk you through "${question}"?`,
    chips: [
      { label: "Yes, explain it", action: { type: "ask", text: "Can you explain that question to me?" } },
      { label: "Why was my answer wrong?", action: { type: "ask", text: "Why was my answer wrong?" } },
    ],
  };
}

// What Smiley opens with when a page goes quiet. Specific to the page, because
// "Need any help?" on every page is just noise. Chips only promise things the
// checked facts can answer.
const NUDGES = {
  "/": {
    text: "Still deciding where to start? I can explain what a T Level is, or what an Amazon placement looks like.",
    chips: [
      { label: "What is a T Level?", action: { type: "ask", text: "What is a T Level?" } },
      { label: "What is an Amazon placement like?", action: { type: "ask", text: "What is an Amazon placement like?" } },
    ],
  },
  "/about": {
    text: "Anything on this page not quite clicking? Ask me and I'll try explaining it another way.",
    chips: [
      { label: "How long is the placement?", action: { type: "ask", text: "How long is the industry placement?" } },
      { label: "Is it like an apprenticeship?", action: { type: "ask", text: "Is a T Level the same as an apprenticeship?" } },
    ],
  },
  "/t-levels-at-amazon": {
    text: "Curious what an Amazon placement actually involves? Ask away.",
    chips: [
      { label: "Who looks after me there?", action: { type: "ask", text: "What support do students get on an Amazon placement?" } },
      { label: "Which pathways does Amazon offer?", action: { type: "ask", text: "Which pathways does Amazon offer placements in?" } },
    ],
  },
  "/resources": {
    text: "Looking for something in particular? Tell me what you need and I'll point you at it.",
    chips: [
      { label: "Which ones need an account?", action: { type: "ask", text: "Which resources need an account?" } },
    ],
  },
  "/t-level-near-you": {
    text: "Hunting for a T Level near you? Ask me anything while you look.",
    chips: [
      { label: "What are the entry requirements?", action: { type: "ask", text: "What are the entry requirements for a T Level?" } },
    ],
  },
  "/quiz": {
    text: "Stuck on one? Tell me which question and I'll talk it through.",
    chips: [],
  },
  "/help": {
    text: "Can't find what you need here? Ask me and I'll have a go.",
    chips: [
      { label: "How do I register my interest?", action: { type: "ask", text: "How do I register my interest in an Amazon placement?" } },
    ],
  },
  "/register": {
    text: "Not sure whether you need an account? I can tell you what it unlocks.",
    chips: [
      { label: "What does an account unlock?", action: { type: "ask", text: "What do I get with an account?" } },
    ],
  },
};

const DEFAULT_NUDGE = {
  text: "Still there? Ask me anything about T Levels and I'll answer if I know it.",
  chips: [{ label: "What is a T Level?", action: { type: "ask", text: "What is a T Level?" } }],
};

/** The nudge for a page, by route. */
export function nudgeForPath(pathname) {
  return NUDGES[pathname] ?? DEFAULT_NUDGE;
}

// The little speech bubble beside Smiley when the chat is closed.
export const TEASERS = {
  hello: "Hi, I'm Smiley! Ask me anything about T Levels.",
  perfect: "Full marks! Nice work.",
  finished: "Done! Want to go over any of them?",
  quiz: "That one was tricky. Want me to explain it?",
};
