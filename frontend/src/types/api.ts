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

/** Loose shape of any JSON error body the API may return (DRF + our views). */
export interface ApiErrorBody {
  status?: string;
  detail?: string;
  [key: string]: unknown;
}
