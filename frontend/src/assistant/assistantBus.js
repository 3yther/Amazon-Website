// How the rest of the site tells the assistant something happened.
//
// The chat widget lives once, in App.jsx, so a quiz sitting inside a page has
// no way to reach it through props. Rather than have the quiz know what a chat
// widget is, it announces the event and the widget listens.
//
// Nothing here is sent anywhere. Messages only reach the server when the
// visitor types one themselves.

const listeners = new Set();

/**
 * Called by a quiz when somebody answers a question wrong.
 *
 * question      the question as it was asked
 * correctAnswer the answer that was right
 * explanation   the quiz's own explanation, when it has one
 *
 * Those three go to the assistant as context, so its answer explains the
 * quiz's own content instead of a version it made up.
 */
export function reportIncorrectAnswer({ question, correctAnswer, explanation = "" }) {
  const detail = { question, correctAnswer, explanation };
  for (const listener of listeners) listener(detail);
}

/** Listen for wrong answers. Returns the function that stops listening. */
export function onIncorrectAnswer(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
