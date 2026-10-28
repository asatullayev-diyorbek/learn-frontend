// Learn — auth endpoints. Thin wrappers over client.js matching the fixed
// backend contract (see project README / spec for the exact shapes).

import { request } from "./client.js";

/** GET /accounts/csrf/ — sets the csrftoken cookie as a side effect. */
export function fetchCsrfCookie() {
  return request("/accounts/csrf/", { method: "GET" });
}

/**
 * POST /accounts/telegram/token/ — creates a fresh one-time token.
 * @returns {Promise<{token: string, deep_link: string, expires_at: string, expires_in_seconds: number}>}
 */
export function requestTelegramToken() {
  return request("/accounts/telegram/token/", { method: "POST" });
}

/**
 * GET /accounts/telegram/token/<token>/status/ — poll target.
 * @param {string} token
 * @returns {Promise<{status: "pending" | "confirmed" | "expired"}>}
 */
export function pollTelegramTokenStatus(token) {
  return request(`/accounts/telegram/token/${encodeURIComponent(token)}/status/`, {
    method: "GET",
  });
}

/**
 * POST /accounts/telegram/code/verify/ — verify the 5-digit bot code.
 * @param {string} code
 * @returns {Promise<{status: "ok"}>} on success (200).
 *   On failure (400) client.js throws ApiError with body
 *   {status: "invalid" | "expired" | "used", detail: string}.
 */
export function verifyTelegramCode(code) {
  return request("/accounts/telegram/code/verify/", {
    method: "POST",
    body: { code },
  });
}

/** POST /accounts/logout/ — not used on the login page, kept for later pages. */
export function logout() {
  return request("/accounts/logout/", { method: "POST" });
}
