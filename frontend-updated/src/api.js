// Small wrapper around fetch for the Django API. Every call goes through here
// so the base URL and error handling live in one place.

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, body) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request(path, { params = {}, signal } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value != null) query.set(key, value);
  }
  const search = query.toString();

  const response = await fetch(`${API_BASE}${path}${search ? `?${search}` : ""}`, {
    headers: { Accept: "application/json" },
    credentials: "include", // send the Django session cookie once login exists
    signal,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch(() => null));
  }
  return response.json();
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
 * Providers within a radius of a postcode: { origin_postcode, radius_miles,
 * count, results }. NOTE: this endpoint is not in MODELS.md yet - there is
 * no provider/college model in the agreed schema. Whoever picks up the
 * backend for this page needs to add it (see the Django spec already drafted
 * for /api/providers/nearby/ if useful as a starting point).
 */
export function getNearbyProviders(params, options) {
  return request("/api/providers/nearby/", { ...options, params });
}
