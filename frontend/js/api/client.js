// Learn — thin fetch wrapper shared by every API module.
//
// - Builds the full URL from API_BASE_URL.
// - Always sends credentials so the Django session / csrftoken cookies flow.
// - Parses JSON bodies (tolerating an empty body).
// - Attaches X-CSRFToken on unsafe methods, read from the csrftoken cookie.
// - Throws a typed ApiError carrying the parsed JSON body on non-2xx responses.

import { API_BASE_URL } from "../config.js";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Error thrown for any non-2xx response. `status` is the HTTP status code,
 * `body` is the parsed JSON (or null if the response had no JSON body).
 */
export class ApiError extends Error {
  constructor(status, body) {
    super((body && (body.detail || body.status)) || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Thrown when the request never reached the server (offline, CORS, DNS, etc). */
export class NetworkError extends Error {
  constructor(cause) {
    super("Network request failed");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

function readCookie(name) {
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = decodeURIComponent(part.slice(0, eq));
    if (key === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

/**
 * @param {string} path - path relative to API_BASE_URL, e.g. "/accounts/csrf/"
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object} [options.body] - will be JSON-stringified
 * @param {object} [options.headers]
 */
export async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const finalHeaders = { ...headers };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (UNSAFE_METHODS.has(method.toUpperCase())) {
    const csrfToken = readCookie("csrftoken");
    if (csrfToken) {
      finalHeaders["X-CSRFToken"] = csrfToken;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    // Network failure, offline, CORS preflight rejection, DNS, etc.
    throw new NetworkError(cause);
  }

  let parsed = null;
  const text = await response.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed);
  }

  return parsed;
}
