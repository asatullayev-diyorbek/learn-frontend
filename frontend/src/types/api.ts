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

/* ---------------------------------------------------------------------------
 * Courses (Django, apps/courses)
 * ------------------------------------------------------------------------ */

export type CourseLevel = "beginner" | "intermediate" | "advanced";

/** GET /courses/categories/ → 200, one item */
export interface Category {
  id: number;
  name: string;
  slug: string;
  course_count: number;
}

/** The category as embedded in a course. */
export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CourseInstructor {
  id: number;
  full_name: string;
  /**
   * Not part of the current contract. Typed as optional so the detail page
   * shows them if the backend ever adds them, and simply omits them today.
   */
  title?: string;
  bio?: string;
}

/** GET /courses/ → `results[]` item */
export interface CourseListItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  level: CourseLevel;
  category: CourseCategory;
  instructor: CourseInstructor;
  /** May be an empty string (no cover). */
  cover_image_url: string;
  enrolled_count: number;
  /** Always false for a guest. */
  is_enrolled: boolean;
}

/** GET /courses/<slug>/ → 200 (404 {detail:"not_found"}) */
export interface CourseDetail extends CourseListItem {
  description: string;
}

/** GET /courses/ → 200, the paginated envelope */
export interface CoursePage {
  count: number;
  /** Absolute URL of the next page, or null on the last one. */
  next: string | null;
  previous: string | null;
  results: CourseListItem[];
}

/** POST /courses/<slug>/enroll/ → 200 */
export interface EnrollResponse {
  status: "enrolled";
  enrolled_count: number;
}

/** DELETE /courses/<slug>/enroll/ → 200 */
export interface UnenrollResponse {
  status: "not_enrolled";
  enrolled_count: number;
}
