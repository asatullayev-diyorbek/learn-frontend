/*
 * One course by slug.
 *
 *   loading ──► ready ──(enroll / unenroll)──► ready (patched in place)
 *      ├──────► not_found            (404 — a dead link, not an outage)
 *      └──────► error ──(retry)──► loading
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, isAbortError } from "../../services/api/client";
import { getCourse } from "../../services/api/courses";
import type { CourseDetail } from "../../types/api";
import { classifyRequestError, type RequestErrorKind } from "../auth/errors";

export type CourseDetailView =
  | { status: "loading" }
  | { status: "ready"; course: CourseDetail }
  | { status: "not_found" }
  | { status: "error"; error: RequestErrorKind };

type Settled = Exclude<CourseDetailView, { status: "loading" }>;

export function useCourseDetail(slug: string) {
  const [result, setResult] = useState<{ slug: string; view: Settled } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getCourse(slug, controller.signal).then(
      (course) => setResult({ slug, view: { status: "ready", course } }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        const view: Settled =
          error instanceof ApiError && error.status === 404
            ? { status: "not_found" }
            : { status: "error", error: classifyRequestError(error) };
        setResult({ slug, view });
      },
    );
    return () => controller.abort();
  }, [slug, attempt]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  /** Merges server-confirmed fields (e.g. after enrolling) into the loaded course. */
  const patchCourse = useCallback((patch: Partial<CourseDetail>) => {
    setResult((prev) =>
      prev && prev.view.status === "ready"
        ? { ...prev, view: { status: "ready", course: { ...prev.view.course, ...patch } } }
        : prev,
    );
  }, []);

  const view: CourseDetailView =
    result && result.slug === slug ? result.view : { status: "loading" };

  return { view, retry, patchCourse };
}
