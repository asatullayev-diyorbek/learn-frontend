/*
 * Who is signed in? The single source of truth for every component that needs
 * to know. CurrentUserProvider calls GET /accounts/me/ once on mount; any
 * component below it reads the result with useCurrentUser() — never fetch
 * /me anywhere else.
 */
import { createContext, useContext } from "react";
import type { CurrentUser } from "../../types/api";
import type { RequestErrorKind } from "./errors";

export type CurrentUserStatus = "loading" | "authenticated" | "guest" | "error";

export type CurrentUserState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: CurrentUser }
  | { status: "guest"; user: null }
  /** /me failed for a reason other than "not signed in" (network, 5xx…). */
  | { status: "error"; user: null; error: RequestErrorKind };

export type SignOutStatus = "idle" | "pending" | "succeeded" | "failed";

export type CurrentUserContextValue = CurrentUserState & {
  /** Re-runs GET /accounts/me/ (after an "error"). */
  retry: () => void;
  /** POST /accounts/logout/; resolves true once the session is gone. Never throws. */
  signOut: () => Promise<boolean>;
  signOutStatus: SignOutStatus;
};

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser() must be used inside <CurrentUserProvider>");
  return ctx;
}

/** First name → "@telegram_username" → "Foydalanuvchi". */
export function getDisplayName(user: CurrentUser): string {
  const firstName = user.first_name.trim();
  if (firstName) return firstName;
  const telegramUsername = user.telegram_username.trim().replace(/^@/, "");
  if (telegramUsername) return `@${telegramUsername}`;
  return "Foydalanuvchi";
}
