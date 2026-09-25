// Small wrapper around fetch for the Django API. Every call goes through here
// so the base URL, error handling and CSRF token live in one place.

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, body) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function readResponse(response) {
  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch(() => null));
  }
  return response.status === 204 ? null : response.json();
}

async function request(path, { params = {}, signal } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value != null) query.set(key, value);
  }
  const search = query.toString();

  const response = await fetch(`${API_BASE}${path}${search ? `?${search}` : ""}`, {
    headers: { Accept: "application/json" },
    credentials: "include", // send the Django session cookie
    signal,
  });

  return readResponse(response);
}

// Cached CSRF token (the promise, so two calls at once share one fetch).
let csrfToken = null;

/** The token Django wants in X-CSRFToken on every POST. Pass { refresh: true } after login. */
export function getCsrfToken({ refresh = false } = {}) {
  if (refresh || !csrfToken) {
    const pending = request("/api/accounts/csrf/").then((data) => data.csrf_token);
    csrfToken = pending;
    pending.catch(() => {
      if (csrfToken === pending) csrfToken = null; // failed, so try again next time
    });
  }
  return csrfToken;
}

async function sendJson(method, path, body) {
  const send = (token) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await send(await getCsrfToken());
  if (response.status === 403) {
    // The token might be old (e.g. logged in on another tab), so get a new one and retry once.
    response = await send(await getCsrfToken({ refresh: true }));
  }

  return readResponse(response);
}

function postJson(path, body) {
  return sendJson("POST", path, body);
}

function patchJson(path, body) {
  return sendJson("PATCH", path, body);
}

/** All pathways, as a plain array. */
export function getPathways(options) {
  return request("/api/pathways/", options);
}

/** One page of content: { count, next, previous, results }. */
export function getContent(filters, options) {
  return request("/api/content/", { ...options, params: filters });
}

/**
 * Schools and colleges near a postcode, nearest first.
 * filters: postcode, pathway (optional slug), radius (optional, miles).
 * Returns { postcode, radius_miles, count, results }.
 */
export function searchProviders(filters, options) {
  return request("/api/providers/search/", { ...options, params: filters });
}

/** The signed-in user, or null if nobody is signed in. */
export async function getCurrentUser(options) {
  try {
    return await request("/api/accounts/me/", options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

// Django makes a new CSRF token when you sign in, so fetch it again.
async function refreshCsrfTokenAfterSignIn() {
  await getCsrfToken({ refresh: true }).catch(() => {});
}

/** Create an account and sign in. */
export async function register(fields) {
  const user = await postJson("/api/accounts/register/", fields);
  await refreshCsrfTokenAfterSignIn();
  return user;
}

/** Sign in. */
export async function login(username, password) {
  const user = await postJson("/api/accounts/login/", { username, password });
  await refreshCsrfTokenAfterSignIn();
  return user;
}

/** Sign out. */
export function logout() {
  return postJson("/api/accounts/logout/");
}

/** Ask for a password reset email. The reply is the same whether or not the username exists. */
export function requestPasswordReset(username) {
  return postJson("/api/accounts/password-reset/", { username });
}

/** Finish a reset with the uid and token from the email link. Also signs you in. */
export async function confirmPasswordReset(fields) {
  const result = await postJson("/api/accounts/password-reset/confirm/", fields);
  await refreshCsrfTokenAfterSignIn();
  return result;
}

/** Update the signed-in user's name, email or phone. */
export function updateProfile(fields) {
  return patchJson("/api/accounts/me/", fields);
}

/** The signed-in user's saved settings (UserPreference in backend/accounts/models.py). */
export function getPreferences(options) {
  return request("/api/accounts/user-preferences/", options);
}

/** Save some of the signed-in user's settings. */
export function updatePreferences(fields) {
  return patchJson("/api/accounts/user-preferences/", fields);
}

/** Change password. fields: current_password, new_password, confirm_password. */
export function changePassword(fields) {
  return postJson("/api/accounts/change-password/", fields);
}

/** Deactivate the account (needs the password). Call refresh() afterwards. */
export function deactivateAccount(password) {
  return postJson("/api/accounts/deactivate-account/", { password });
}

/** Send an Expression of Interest. */
export function submitInterest(fields) {
  return postJson("/api/interest/", fields);
}

/** One page of interest submissions. Amazon staff only (the server checks this). */
export function getInterestSubmissions(params, options) {
  return request("/api/interest/submissions/", { ...options, params });
}

/** Send feedback about the site. Anyone can, signed in or not. */
export function submitFeedback(fields) {
  return postJson("/api/accounts/feedback/", fields);
}

/**
 * Send a message to Smiley and get { reply }.
 * quiz: the question they got wrong, if that started the chat.
 * audience: student, parent or teacher. Throws a 503 ApiError if the AI is down.
 */
export function sendChatMessage(message, { quiz, audience, language } = {}) {
  return postJson("/api/chat/", {
    message,
    ...(audience && { audience }),
    // so Smiley answers in the site's language
    ...(language && { language }),
    ...(quiz && {
      quiz_question: quiz.question,
      quiz_correct_answer: quiz.correctAnswer,
      quiz_chosen_answer: quiz.chosenAnswer ?? "",
      quiz_explanation: quiz.explanation ?? "",
    }),
  });
}

/** This visitor's recent chat messages. */
export function getChatHistory(options) {
  return request("/api/chat/", options);
}

// --- the Community -----------------------------------------------------------

/** One page of Community questions. filters: topic, pathway, sort, q, page. */
export function getQuestions(filters, options) {
  return request("/api/community/questions/", { ...options, params: filters });
}

/** One question with its answers. */
export function getQuestion(id, options) {
  return request(`/api/community/questions/${id}/`, options);
}

/** Ask a question. A 400 with "moderation" means the filter stopped it. */
export function askQuestion(fields) {
  return postJson("/api/community/questions/", fields);
}

export function answerQuestion(questionId, body) {
  return postJson(`/api/community/questions/${questionId}/answers/`, { body });
}

export function deleteQuestion(id) {
  return sendJson("DELETE", `/api/community/questions/${id}/`);
}

export function deleteAnswer(id) {
  return sendJson("DELETE", `/api/community/answers/${id}/`);
}

/** Marks a post helpful, or takes the mark back. kind: "questions" | "answers". */
export function markHelpful(kind, id) {
  return postJson(`/api/community/${kind}/${id}/helpful/`);
}

/** The person who asked marks the answer that helped (or unmarks it). */
export function acceptAnswer(id) {
  return postJson(`/api/community/answers/${id}/accept/`);
}

/** Flags a post for staff. kind: "questions" | "answers". */
export function reportPost(kind, id, reason, note = "") {
  return postJson(`/api/community/${kind}/${id}/report/`, { reason, note });
}
