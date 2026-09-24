// How the rest of the site tells Smiley something happened.
//
// Smiley lives once, in App.jsx, so a quiz sitting inside a page has no way to
// reach it through props. Rather than have the quiz know what a chat widget
// is, it announces what happened and Smiley listens.
//
// Nothing here is sent anywhere. Messages only reach the server when the
// visitor types (or picks) one themselves.

const listeners = new Set();

function emit(event) {
  for (const listener of listeners) listener(event);
}

/**
 * Called by a quiz when somebody answers a question wrong.
 *
 * question      the question as it was asked
 * correctAnswer the answer that was right
 * chosenAnswer  the answer they picked
 * explanation   the quiz's own explanation, when it has one
 *
 * These go to Smiley as context if the visitor asks for help, so its answer
 * explains the quiz's own content instead of a version it made up.
 */
export function reportIncorrectAnswer({ question, correctAnswer, chosenAnswer = "", explanation = "" }) {
  emit({ type: "incorrect", question, correctAnswer, chosenAnswer, explanation });
}

/** Called by a quiz when somebody gets a question right. Smiley is pleased. */
export function reportCorrectAnswer({ question }) {
  emit({ type: "correct", question });
}

/** Called by a quiz when somebody reaches the end. */
export function reportQuizFinished({ score, total }) {
  emit({ type: "finished", score, total });
}

/** Listen for every quiz event. Returns the function that stops listening. */
export function onQuizEvent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- easter eggs -----------------------------------------------------------

const eggListeners = new Set();

/** Tells Smiley somebody found an easter egg elsewhere on the site, e.g. "wordmark". */
export function reportEasterEgg(type) {
  for (const listener of eggListeners) listener(type);
}

/** Listen for easter eggs. Returns the function that stops listening. */
export function onEasterEgg(listener) {
  eggListeners.add(listener);
  return () => eggListeners.delete(listener);
}

/** Listen for wrong answers only. Returns the function that stops listening. */
export function onIncorrectAnswer(listener) {
  return onQuizEvent((event) => {
    if (event.type === "incorrect") listener(event);
  });
}
