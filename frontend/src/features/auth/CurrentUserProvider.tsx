import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAbortError } from "../../services/api/client";
import { ensureCsrfCookie, getCurrentUser, logout } from "../../services/api/auth";
import { classifyRequestError } from "./errors";
import {
  CurrentUserContext,
  type CurrentUserContextValue,
  type CurrentUserState,
  type SignOutStatus,
} from "./useCurrentUser";

/**
 * Loads the current user once on mount and shares it via context.
 *
 *   loading ──► authenticated ──(signOut)──► guest
 *      │  └──► guest
 *      └─────► error ──(retry)──► loading
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrentUserState>({ status: "loading", user: null });
  const [attempt, setAttempt] = useState(0);
  const [signOutStatus, setSignOutStatus] = useState<SignOutStatus>("idle");
  const signOutInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser(controller.signal).then(
      (user) =>
        setState(user ? { status: "authenticated", user } : { status: "guest", user: null }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        setState({ status: "error", user: null, error: classifyRequestError(error) });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null });
    setAttempt((n) => n + 1);
  }, []);

  const signOut = useCallback(async () => {
    if (signOutInFlight.current) return false;
    signOutInFlight.current = true;
    setSignOutStatus("pending");
    try {
      await ensureCsrfCookie();
      await logout();
      setState({ status: "guest", user: null });
      setSignOutStatus("succeeded");
      return true;
    } catch {
      // Still signed in as far as we know — keep the user, report the failure.
      setSignOutStatus("failed");
      return false;
    } finally {
      signOutInFlight.current = false;
    }
  }, []);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ ...state, retry, signOut, signOutStatus }),
    [state, retry, signOut, signOutStatus],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}
