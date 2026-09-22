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

async function postJson(path, body) {
  const send = (token) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
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

/** All pathways, as a plain array. */
export function getPathways(options) {
  return request("/api/pathways/", options);
}

/** One page of content: { count, next, previous, results }. */
export function getContent(filters, options) {
  return request("/api/content/", { ...options, params: filters });
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
 * Send an Expression of Interest.
 * fields: full_name, email, user_type, pathway (a slug), message (optional).
 * Resolves to { id, pathway, submitted_at }.
 */
export function submitInterest(fields) {
  return postJson("/api/interest/", fields);
}
