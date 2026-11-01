import type {
  AvailableCourseWithTopics,
  VideoSubmission,
} from "../../types/api";
import { request } from "./client";

/**
 * Fetch the authenticated student's video submissions.
 * GET /submissions/mine/
 */
export async function getMySubmissions(signal?: AbortSignal): Promise<VideoSubmission[]> {
  return request<VideoSubmission[]>("/submissions/mine/", { signal });
}

/**
 * Bind an awaiting video submission to a specific course topic.
 * POST /submissions/<id>/bind/
 */
export async function bindSubmissionTopic(
  submissionId: number,
  topicId: number,
  signal?: AbortSignal
): Promise<VideoSubmission> {
  return request<VideoSubmission>(`/submissions/${submissionId}/bind/`, {
    method: "POST",
    body: { topic_id: topicId },
    signal,
  });
}

/**
 * Fetch list of published courses with their topics for the bind dropdown.
 * GET /submissions/available-topics/
 */
export async function getAvailableTopics(
  signal?: AbortSignal
): Promise<AvailableCourseWithTopics[]> {
  return request<AvailableCourseWithTopics[]>("/submissions/available-topics/", { signal });
}

