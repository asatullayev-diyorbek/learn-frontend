/*
 * Thin fetch wrapper shared by every API module.
 *
 * - Resolves paths against VITE_API_BASE_URL (default http://localhost:8000/api).
 * - Always sends credentials so Django's session + csrftoken cookies flow.
 * - Attaches X-CSRFToken (read from the csrftoken cookie) on unsafe methods.
 * - Parses JSON (tolerating empty bodies) and throws typed errors:
 *     ApiError     — the server answered with a non-2xx status
 *     NetworkError — the request never got a response (offline, CORS, DNS)
 *   Aborted requests re-throw the native AbortError untouched so callers can
 *   tell "cancelled by us" apart from real failures (see isAbortError).
 */

import type { ApiErrorBody } from "../../types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  "",
);

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.detail ?? body?.status ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network request failed", { cause });
    this.name = "NetworkError";
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined" || !document.cookie) return null;
  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (decodeURIComponent(part.slice(0, eq)) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  /** Serialised as JSON. */
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = readCookie("csrftoken");
    if (csrfToken) headers["X-CSRFToken"] = csrfToken;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new NetworkError(cause);
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errorBody = parsed && typeof parsed === "object" ? (parsed as ApiErrorBody) : null;
    throw new ApiError(response.status, errorBody);
  }

  return parsed as T;
}
