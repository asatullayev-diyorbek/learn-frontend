/*
 * The auth calls of the fixed backend contract. Paths, payloads and
 * response shapes must stay exactly as the Django backend implements them.
 */

import type {
  CsrfResponse,
  CurrentUser,
  LogoutResponse,
  TelegramTokenResponse,
  TokenStatusResponse,
  VerifyCodeSuccessResponse,
} from "../../types/api";
import { ApiError, readCookie, request } from "./client";

/** GET /accounts/csrf/ — sets the `csrftoken` cookie as a side effect. */
export function fetchCsrfCookie(signal?: AbortSignal): Promise<CsrfResponse> {
  return request<CsrfResponse>("/accounts/csrf/", { signal });
}

/** Fetches the CSRF cookie only if the browser does not already hold one. */
export async function ensureCsrfCookie(signal?: AbortSignal): Promise<void> {
  if (!readCookie("csrftoken")) {
    await fetchCsrfCookie(signal);
  }
}

/** POST /accounts/telegram/token/ — no body; creates a one-time login token. */
export function requestTelegramToken(signal?: AbortSignal): Promise<TelegramTokenResponse> {
  return request<TelegramTokenResponse>("/accounts/telegram/token/", { method: "POST", signal });
}

/** GET /accounts/telegram/token/<token>/status/ — always 200. */
export function getTelegramTokenStatus(
  token: string,
  signal?: AbortSignal,
): Promise<TokenStatusResponse> {
  return request<TokenStatusResponse>(
    `/accounts/telegram/token/${encodeURIComponent(token)}/status/`,
    { signal },
  );
}

/**
 * POST /accounts/telegram/code/verify/ — 200 {status:"ok"} on success.
 * On 400 the client throws ApiError whose body is VerifyCodeErrorResponse.
 */
export function verifyTelegramCode(
  code: string,
  signal?: AbortSignal,
): Promise<VerifyCodeSuccessResponse> {
  return request<VerifyCodeSuccessResponse>("/accounts/telegram/code/verify/", {
    method: "POST",
    body: { code },
    signal,
  });
}

/** POST /accounts/logout/ — needs the CSRF cookie (call ensureCsrfCookie first). */
export function logout(signal?: AbortSignal): Promise<LogoutResponse> {
  return request<LogoutResponse>("/accounts/logout/", { method: "POST", signal });
}

/**
 * GET /accounts/me/ — the signed-in user, or null when there is no session.
 *
 * A 401 {detail:"not_authenticated"} is an expected answer ("guest"), not a
 * failure, so it resolves to null. Anything else — NetworkError, 5xx, other
 * ApiErrors, AbortError — is re-thrown for the caller to handle.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser | null> {
  try {
    return await request<CurrentUser>("/accounts/me/", { signal });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
