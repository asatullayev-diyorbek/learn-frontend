/*
 * The signed-in user's courses (GET /courses/mine/), loaded once on mount.
 *
 *   loading ──► ready             ([] is a valid answer: no enrolments yet)
 *      ├──────► signed_out        (401 — the session ended after /me said otherwise)
 *      └──────► error ──(retry)──► loading
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, isAbortError } from "../../services/api/client";
import { getMyCourses } from "../../services/api/courses";
import type { MyCourse } from "../../types/api";
import { classifyRequestError, type RequestErrorKind } from "../auth/errors";

export type MyCoursesView =
  | { status: "loading" }
  | { status: "ready"; courses: MyCourse[] }
  | { status: "signed_out" }
  | { status: "error"; error: RequestErrorKind };

export function useMyCourses() {
  const [view, setView] = useState<MyCoursesView>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMyCourses(controller.signal).then(
      (courses) => setView({ status: "ready", courses }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        setView(
          error instanceof ApiError && error.status === 401
            ? { status: "signed_out" }
            : { status: "error", error: classifyRequestError(error) },
        );
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setView({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { view, retry };
}
