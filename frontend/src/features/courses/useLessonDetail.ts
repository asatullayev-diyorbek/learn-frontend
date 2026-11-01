import { useCallback, useEffect, useState } from "react";
import { ApiError, isAbortError } from "../../services/api/client";
import { getTopicDetail } from "../../services/api/courses";
import type { TopicDetail } from "../../types/api";
import { classifyRequestError, type RequestErrorKind } from "../auth/errors";

export type LessonDetailView =
  | { status: "loading" }
  | { status: "ready"; lesson: TopicDetail }
  | { status: "not_found" }
  | { status: "error"; error: RequestErrorKind };

type Settled = Exclude<LessonDetailView, { status: "loading" }>;

export function useLessonDetail(slug: string, topicId: string) {
  const key = `${slug}:${topicId}`;
  const [result, setResult] = useState<{ key: string; view: Settled } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getTopicDetail(slug, topicId, controller.signal).then(
      (lesson) => setResult({ key, view: { status: "ready", lesson } }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        const view: Settled =
          error instanceof ApiError && error.status === 404
            ? { status: "not_found" }
            : { status: "error", error: classifyRequestError(error) };
        setResult({ key, view });
      },
    );
    return () => controller.abort();
  }, [key, slug, topicId, attempt]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  const view: LessonDetailView =
    result && result.key === key ? result.view : { status: "loading" };

  return { view, retry };
}
