/*
 * Method 1 orchestration: CSRF cookie → one-time token → status polling.
 *
 *   loading ──► ready ──► confirmed
 *      ▲          │  └──► expired ──┐
 *      │          └ (3 failed polls: connectionLost, keeps polling)
 *      └──────── retry ◄── error ◄──┘ (retry from expired too)
 */
import { useCallback, useEffect, useReducer, useRef } from "react";
import { usePolling } from "../../hooks/usePolling";
import { isAbortError } from "../../services/api/client";
import {
  ensureCsrfCookie,
  fetchCsrfCookie,
  getTelegramTokenStatus,
  requestTelegramToken,
} from "../../services/api/auth";
import type { TelegramTokenResponse } from "../../types/api";
import { deriveBotUrl } from "./botLink";
import { classifyRequestError, type RequestErrorKind } from "./errors";

export const POLL_INTERVAL_MS = 2000;
const FAILURES_BEFORE_CONNECTION_LOST = 3;

export type TokenView =
  | { status: "loading" }
  | {
      status: "ready";
      token: string;
      deepLink: string;
      /** Epoch ms. Derived from expires_in_seconds + local receipt time (skew-proof). */
      deadline: number;
      connectionLost: boolean;
    }
  | { status: "expired" }
  | { status: "error"; error: RequestErrorKind }
  | { status: "confirmed" };

interface State {
  view: TokenView;
  /** Plain bot URL; kept across retries so method 2 never loses its link. */
  botUrl: string | null;
}

type Action =
  | { type: "start" }
  | { type: "received"; data: TelegramTokenResponse; receivedAt: number }
  | { type: "failed"; error: RequestErrorKind }
  | { type: "polled"; token: string; status: "pending" | "confirmed" | "expired" }
  | { type: "connectionLost"; token: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, view: { status: "loading" } };
    case "received":
      return {
        botUrl: deriveBotUrl(action.data.deep_link),
        view: {
          status: "ready",
          token: action.data.token,
          deepLink: action.data.deep_link,
          deadline: action.receivedAt + action.data.expires_in_seconds * 1000,
          connectionLost: false,
        },
      };
    case "failed":
      return { ...state, view: { status: "error", error: action.error } };
    case "polled": {
      // Ignore answers for a token that is no longer current.
      if (state.view.status !== "ready" || state.view.token !== action.token) return state;
      if (action.status === "confirmed") return { ...state, view: { status: "confirmed" } };
      if (action.status === "expired") return { ...state, view: { status: "expired" } };
      if (!state.view.connectionLost) return state;
      return { ...state, view: { ...state.view, connectionLost: false } };
    }
    case "connectionLost":
      if (state.view.status !== "ready" || state.view.token !== action.token) return state;
      if (state.view.connectionLost) return state;
      return { ...state, view: { ...state.view, connectionLost: true } };
  }
}

export function useTokenLogin({ paused = false }: { paused?: boolean } = {}) {
  const [state, dispatch] = useReducer(reducer, { view: { status: "loading" }, botUrl: null });
  const requestController = useRef<AbortController | null>(null);
  const pollFailures = useRef(0);

  const load = useCallback(async (isInitialLoad: boolean) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    try {
      // Contract: GET csrf once on page load; on retries only if the cookie is missing.
      if (isInitialLoad) await fetchCsrfCookie(controller.signal);
      else await ensureCsrfCookie(controller.signal);
      const data = await requestTelegramToken(controller.signal);
      pollFailures.current = 0;
      dispatch({ type: "received", data, receivedAt: Date.now() });
    } catch (error) {
      if (isAbortError(error)) return;
      dispatch({ type: "failed", error: classifyRequestError(error) });
    }
  }, []);

  useEffect(() => {
    // Also gates the *initial* request, not just polling: a caller that
    // starts out paused (e.g. "is this browser already signed in?") must
    // not burn a one-time token before it even knows whether to show the form.
    if (paused) return;
    void load(true);
    return () => requestController.current?.abort();
  }, [load, paused]);

  const retry = useCallback(() => {
    dispatch({ type: "start" });
    void load(false);
  }, [load]);

  const { view } = state;

  usePolling(
    async (signal) => {
      if (view.status !== "ready") return;
      const { token } = view;
      try {
        const { status } = await getTelegramTokenStatus(token, signal);
        pollFailures.current = 0;
        dispatch({ type: "polled", token, status });
      } catch (error) {
        if (isAbortError(error)) return;
        pollFailures.current += 1;
        if (pollFailures.current >= FAILURES_BEFORE_CONNECTION_LOST) {
          dispatch({ type: "connectionLost", token });
        }
      }
    },
    { intervalMs: POLL_INTERVAL_MS, enabled: view.status === "ready" && !paused },
  );

  return { view, botUrl: state.botUrl, retry };
}
