// Lets other parts of the site (like the quiz) tell Smiley something happened.
// Nothing here is sent to the server.

const listeners = new Set();

function emit(event) {
  for (const listener of listeners) listener(event);
}

/** Called by a quiz when someone gets a question wrong, so Smiley can offer to explain it. */
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
