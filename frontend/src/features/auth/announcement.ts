/*
 * The screen-reader announcement is derived from state rather than pushed
 * imperatively: whatever the user should hear "right now" is a pure function
 * of the two flows + the active tab, rendered into one aria-live region.
 */
import type { AuthMethod } from "./AuthTabs";
import { AUTH_COPY, CODE_ERROR_COPY, TOKEN_ERROR_COPY } from "./copy";
import type { CodeView } from "./useCodeLogin";
import type { TokenView } from "./useTokenLogin";

export function deriveAnnouncement(
  method: AuthMethod,
  token: TokenView,
  code: CodeView,
  signedIn: boolean,
): string {
  if (signedIn) return `${AUTH_COPY.success.title}. ${AUTH_COPY.success.description}`;

  if (method === "token") {
    switch (token.status) {
      case "loading":
        return AUTH_COPY.token.loading;
      case "ready":
        return token.connectionLost
          ? AUTH_COPY.token.reconnecting
          : `Kirish havolasi tayyor. ${AUTH_COPY.token.waiting}.`;
      case "expired":
        return `${AUTH_COPY.token.expiredTitle}. ${AUTH_COPY.token.expiredDescription}`;
      case "error": {
        const copy = TOKEN_ERROR_COPY[token.error];
        return `${copy.title}. ${copy.description}`;
      }
      case "confirmed":
        return "";
    }
  }

  switch (code.status) {
    case "submitting":
      return AUTH_COPY.code.submitting;
    case "error":
      // Alternate a trailing no-break space so an identical repeated error
      // still changes the region's content and is announced again.
      return CODE_ERROR_COPY[code.error] + (code.attempt % 2 ? " " : "");
    default:
      return "";
  }
}
