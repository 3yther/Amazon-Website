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

// Cached CSRF token. Holds the pending request rather than the string, so
// calls made at the same moment share one fetch instead of racing.
let csrfToken = null;

/**
 * The token Django expects in X-CSRFToken on every POST (see the comment at
 * the top of backend/accounts/views.py). Fetched once, then cached. Pass
 * { refresh: true } to fetch a new one, e.g. after login.
 */
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
    // The cached token may be stale (e.g. rotated by a login in another tab).
    // Fetch a fresh one and retry once.
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
 * Schools and colleges near a postcode, nearest first:
 * { postcode, radius_miles, count, results }. Each result has id, name,
 * address, postcode, distance_miles, website_url and pathways.
 *
 * filters: postcode (required), pathway (a slug, optional), radius (miles,
 * optional, default 15). Throws ApiError(400) with field errors when the
 * postcode does not exist or a filter is unknown, and ApiError(503) when the
 * postcode lookup service itself is down.
 */
export function searchProviders(filters, options) {
  return request("/api/providers/search/", { ...options, params: filters });
}

/**
 * The signed-in user: { id, username, user_type, pathway_interest }.
 * Resolves to null when nobody is signed in, since that is a normal state.
 */
export async function getCurrentUser(options) {
  try {
    return await request("/api/accounts/me/", options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

// Django issues a new CSRF token when a session starts. If fetching it fails
// here, the cache is cleared and the next POST fetches one itself.
async function refreshCsrfTokenAfterSignIn() {
  await getCsrfToken({ refresh: true }).catch(() => {});
}

/**
 * Create an account and sign in.
 * fields: username, password, password_confirm, user_type, pathway_interest (optional).
 * Resolves to { id, username, user_type }.
 */
export async function register(fields) {
  const user = await postJson("/api/accounts/register/", fields);
  await refreshCsrfTokenAfterSignIn();
  return user;
}

/** Sign in. Resolves to { id, username, user_type }. */
export async function login(username, password) {
  const user = await postJson("/api/accounts/login/", { username, password });
  await refreshCsrfTokenAfterSignIn();
  return user;
}

/** Sign out. Resolves to null. */
export function logout() {
  return postJson("/api/accounts/logout/");
}

/**
 * Update the signed-in user's name, email or phone.
 * fields: any of first_name, last_name, email, phone.
 * Resolves to the same shape as getCurrentUser().
 */
export function updateProfile(fields) {
  return patchJson("/api/accounts/me/", fields);
}

/**
 * The signed-in user's accessibility preferences, created with defaults on
 * first request. See backend/accounts/models.py UserPreference for the fields.
 */
export function getPreferences(options) {
  return request("/api/accounts/user-preferences/", options);
}

/** Partially update the signed-in user's accessibility preferences. */
export function updatePreferences(fields) {
  return patchJson("/api/accounts/user-preferences/", fields);
}

/**
 * Change the signed-in user's password.
 * fields: current_password, new_password, confirm_password.
 * Resolves to { success: true }, or throws ApiError(400) with field errors.
 */
export function changePassword(fields) {
  return postJson("/api/accounts/change-password/", fields);
}

/**
 * Deactivate the signed-in user's account after confirming their password.
 * Ends the session server-side, so call refresh() afterwards.
 */
export function deactivateAccount(password) {
  return postJson("/api/accounts/deactivate-account/", { password });
}

/**
 * Send an Expression of Interest.
 * fields: full_name, email, user_type, pathway (a slug), message (optional).
 * Resolves to { id, pathway, submitted_at }.
 */
export function submitInterest(fields) {
  return postJson("/api/interest/", fields);
}

/**
 * One page of Expression of Interest submissions: { count, next, previous,
 * results }. Amazon staff only; anyone else gets ApiError 403. The check
 * that matters is the server's (accounts/permissions.py IsAmazonStaff), not
 * anything the front end does with this.
 */
export function getInterestSubmissions(params, options) {
  return request("/api/interest/submissions/", { ...options, params });
}

/**
 * Send feedback about the site. Open to anyone: signed in or not.
 * fields: category, message, email (optional; ignored server-side if signed in).
 * Resolves to { success: true }.
 */
export function submitFeedback(fields) {
  return postJson("/api/accounts/feedback/", fields);
}

/**
 * Send a message to Smiley, the AI assistant, and get its reply: { reply }.
 *
 * Both options are optional, and neither is stored (only the message is):
 *   quiz      set when a wrong quiz answer started the conversation:
 *             { question, correctAnswer, chosenAnswer, explanation }. It
 *             grounds the reply in that question.
 *   audience  "student", "parent" or "teacher", from the question Smiley asks
 *             first, so the reply can be pitched for them.
 *
 * Nothing about how the visitor moved around the site is sent: idle time,
 * scrolling and mouse movement stay in the browser.
 *
 * Throws ApiError with status 503 when the assistant itself is unavailable, so
 * the widget can show its fallback message.
 */
export function sendChatMessage(message, { quiz, audience } = {}) {
  return postJson("/api/chat/", {
    message,
    ...(audience && { audience }),
    ...(quiz && {
      quiz_question: quiz.question,
      quiz_correct_answer: quiz.correctAnswer,
      quiz_chosen_answer: quiz.chosenAnswer ?? "",
      quiz_explanation: quiz.explanation ?? "",
    }),
  });
}

/**
 * This visitor's recent chat messages: { messages: [{ role, message, created_at }] }.
 * Empty for a visitor who has not chatted before.
 */
export function getChatHistory(options) {
  return request("/api/chat/", options);
}
