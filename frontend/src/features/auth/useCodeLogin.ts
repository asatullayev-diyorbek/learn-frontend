/* Method 2 orchestration: validate locally → POST code → map the outcome. */
import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "../../services/api/client";
import { ensureCsrfCookie, verifyTelegramCode } from "../../services/api/auth";
import { classifyVerifyError, type CodeErrorKind } from "./errors";

export const CODE_LENGTH = 5;
const CODE_PATTERN = new RegExp(`^\\d{${CODE_LENGTH}}$`);

export type CodeView =
  | { status: "idle" }
  | { status: "submitting" }
  /** `attempt` increments on every failure so repeated identical errors are re-announced. */
  | { status: "error"; error: CodeErrorKind; attempt: number }
  | { status: "success" };

export function sanitizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export function useCodeLogin() {
  const [view, setView] = useState<CodeView>({ status: "idle" });
  const attempts = useRef(0);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const fail = useCallback((error: CodeErrorKind) => {
    attempts.current += 1;
    setView({ status: "error", error, attempt: attempts.current });
  }, []);

  /** Resolves true on success. Never throws. */
  const submit = useCallback(
    async (code: string): Promise<boolean> => {
      if (inFlight.current) return false;
      if (!CODE_PATTERN.test(code)) {
        fail("incomplete");
        return false;
      }

      const controller = new AbortController();
      inFlight.current = controller;
      setView({ status: "submitting" });
      try {
        await ensureCsrfCookie(controller.signal);
        await verifyTelegramCode(code, controller.signal);
        setView({ status: "success" });
        return true;
      } catch (error) {
        if (!isAbortError(error)) fail(classifyVerifyError(error));
        return false;
      } finally {
        inFlight.current = null;
      }
    },
    [fail],
  );

  const clearError = useCallback(() => {
    setView((current) => (current.status === "error" ? { status: "idle" } : current));
  }, []);

  return { view, submit, clearError };
}
