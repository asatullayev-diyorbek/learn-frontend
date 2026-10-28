/*
 * Enroll / unenroll for one course. No optimistic flip: the button shows a
 * spinner, and only the server's answer changes `is_enrolled` and
 * `enrolled_count`. A failure leaves the course exactly as it was.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ensureCsrfCookie } from "../../services/api/auth";
import { ApiError, isAbortError } from "../../services/api/client";
import { enrollInCourse, unenrollFromCourse } from "../../services/api/courses";
import type { CourseDetail } from "../../types/api";
import { classifyRequestError } from "../auth/errors";
import type { EnrollErrorKind } from "./copy";

export type EnrollAction = "enroll" | "unenroll";

export type EnrollmentState =
  | { status: "idle" }
  | { status: "pending"; action: EnrollAction }
  | { status: "done"; action: EnrollAction }
  | { status: "error"; action: EnrollAction; error: EnrollErrorKind };

function classifyEnrollError(error: unknown): EnrollErrorKind {
  if (error instanceof ApiError && error.status === 401) return "not_authenticated";
  return classifyRequestError(error);
}

export function useEnrollment(
  course: Pick<CourseDetail, "slug" | "is_enrolled">,
  onChanged: (patch: Pick<CourseDetail, "is_enrolled" | "enrolled_count">) => void,
) {
  const [state, setState] = useState<EnrollmentState>({ status: "idle" });
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const toggle = useCallback(async () => {
    if (inFlight.current) return;
    const action: EnrollAction = course.is_enrolled ? "unenroll" : "enroll";
    const controller = new AbortController();
    inFlight.current = controller;
    setState({ status: "pending", action });
    try {
      await ensureCsrfCookie(controller.signal);
      const response =
        action === "enroll"
          ? await enrollInCourse(course.slug, controller.signal)
          : await unenrollFromCourse(course.slug, controller.signal);
      onChanged({
        is_enrolled: response.status === "enrolled",
        enrolled_count: response.enrolled_count,
      });
      setState({ status: "done", action });
    } catch (error) {
      if (!isAbortError(error)) setState({ status: "error", action, error: classifyEnrollError(error) });
    } finally {
      inFlight.current = null;
    }
  }, [course.slug, course.is_enrolled, onChanged]);

  return { state, toggle };
}
