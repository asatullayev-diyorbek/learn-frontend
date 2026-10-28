/*
 * Types for the fixed backend contract (Django, apps/accounts).
 * These mirror the server responses exactly — do not reshape them here.
 */

/** GET /accounts/csrf/ → 200 */
export interface CsrfResponse {
  detail: "ok";
}

/** POST /accounts/telegram/token/ → 201 */
export interface TelegramTokenResponse {
  token: string;
  /** https://t.me/<bot_username>?start=<token> */
  deep_link: string;
  /** ISO 8601, UTC */
  expires_at: string;
  expires_in_seconds: number;
}

export type TokenStatus = "pending" | "confirmed" | "expired";

/** GET /accounts/telegram/token/<token>/status/ → always 200 */
export interface TokenStatusResponse {
  status: TokenStatus;
}

/** POST /accounts/telegram/code/verify/ request body */
export interface VerifyCodeRequest {
  code: string;
}

/** POST /accounts/telegram/code/verify/ → 200 */
export interface VerifyCodeSuccessResponse {
  status: "ok";
}

export type VerifyCodeFailureStatus = "invalid" | "expired" | "used";

/** POST /accounts/telegram/code/verify/ → 400 */
export interface VerifyCodeErrorResponse {
  status: VerifyCodeFailureStatus;
  detail: string;
}

/** POST /accounts/logout/ → 200 */
export interface LogoutResponse {
  status: "ok";
}

/** GET /accounts/me/ → 200 (authenticated) */
export interface CurrentUser {
  id: number;
  username: string;
  /** May be an empty string. */
  first_name: string;
  last_name: string;
  /** null if the account has no linked Telegram identity. */
  telegram_id: number | null;
  /** Without the leading "@"; may be an empty string. */
  telegram_username: string;
}

/** GET /accounts/me/ → 401 (no session) */
export interface NotAuthenticatedResponse {
  detail: "not_authenticated";
}

/** Loose shape of any JSON error body the API may return (DRF + our views). */
export interface ApiErrorBody {
  status?: string;
  detail?: string;
  [key: string]: unknown;
}
