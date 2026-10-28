import { ApiError, NetworkError } from "../../services/api/client";
import type { VerifyCodeFailureStatus } from "../../types/api";

/** Failure categories for the token request (method 1). */
export type RequestErrorKind = "network" | "rate_limited" | "server";

/** Failure categories for code verification (method 2). */
export type CodeErrorKind = "incomplete" | VerifyCodeFailureStatus | RequestErrorKind;

const VERIFY_FAILURES: readonly VerifyCodeFailureStatus[] = ["invalid", "expired", "used"];

export function classifyRequestError(error: unknown): RequestErrorKind {
  if (error instanceof NetworkError) return "network";
  if (error instanceof ApiError && error.status === 429) return "rate_limited";
  return "server";
}

export function classifyVerifyError(error: unknown): CodeErrorKind {
  if (error instanceof ApiError && error.status === 400) {
    const status = error.body?.status;
    return VERIFY_FAILURES.find((s) => s === status) ?? "invalid";
  }
  return classifyRequestError(error);
}
