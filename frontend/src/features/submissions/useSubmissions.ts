import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "../../services/api/client";
import {
  bindSubmissionTopic,
  getAvailableTopics,
  getMySubmissions,
} from "../../services/api/submissions";
import type { AvailableCourseWithTopics, VideoSubmission } from "../../types/api";

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourseWithTopics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bindingId, setBindingId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getMySubmissions(controller.signal),
      getAvailableTopics(controller.signal),
    ])
      .then(([subs, courses]) => {
        setSubmissions(subs);
        setAvailableCourses(courses);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(
          err instanceof Error
            ? err.message
            : "Videolarni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring."
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const refresh = useCallback(() => {
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  const bindTopic = useCallback(async (submissionId: number, topicId: number) => {
    setBindingId(submissionId);
    try {
      const updated = await bindSubmissionTopic(submissionId, topicId);
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? updated : sub))
      );
      return { ok: true, data: updated };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Mavzuni biriktirishda xatolik yuz berdi.";
      return { ok: false, error: msg };
    } finally {
      setBindingId(null);
    }
  }, []);

  return {
    submissions,
    availableCourses,
    loading,
    error,
    bindingId,
    refresh,
    bindTopic,
  };
}
