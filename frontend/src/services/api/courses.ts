/*
 * The courses calls of the fixed backend contract. Paths, query params and
 * response shapes must stay exactly as the Django backend implements them.
 */

import type {
  Category,
  CourseDetail,
  CourseLevel,
  CoursePage,
  EnrollResponse,
  UnenrollResponse,
} from "../../types/api";
import { request } from "./client";

/** GET /courses/categories/ */
export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return request<Category[]>("/courses/categories/", { signal });
}

export interface CourseListParams {
  /** Category slug. */
  category?: string;
  level?: CourseLevel;
  search?: string;
  /** 1-based; omitted for the first page. */
  page?: number;
}

/** GET /courses/?category=&level=&search=&page= — empty params are left out. */
export function getCourses(params: CourseListParams = {}, signal?: AbortSignal): Promise<CoursePage> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.level) query.set("level", params.level);
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return request<CoursePage>(`/courses/${qs ? `?${qs}` : ""}`, { signal });
}

/**
 * The page number a paginated envelope's `next` URL points at, or null on the
 * last page. We only read `page` from it and re-request through our own base
 * URL, so a backend that builds absolute URLs for another host still works.
 */
export function nextPageNumber(next: string | null): number | null {
  if (!next) return null;
  try {
    const page = Number(new URL(next, "http://localhost").searchParams.get("page"));
    return Number.isInteger(page) && page > 1 ? page : null;
  } catch {
    return null;
  }
}

/** GET /courses/<slug>/ — 404 {detail:"not_found"} surfaces as ApiError(404). */
export function getCourse(slug: string, signal?: AbortSignal): Promise<CourseDetail> {
  return request<CourseDetail>(`/courses/${encodeURIComponent(slug)}/`, { signal });
}

/**
 * POST /courses/<slug>/enroll/ — idempotent. Needs the CSRF cookie (call
 * ensureCsrfCookie first); 401 {detail:"not_authenticated"} without a session.
 */
export function enrollInCourse(slug: string, signal?: AbortSignal): Promise<EnrollResponse> {
  return request<EnrollResponse>(`/courses/${encodeURIComponent(slug)}/enroll/`, {
    method: "POST",
    signal,
  });
}

/** DELETE /courses/<slug>/enroll/ — idempotent; same auth + CSRF as enrolling. */
export function unenrollFromCourse(slug: string, signal?: AbortSignal): Promise<UnenrollResponse> {
  return request<UnenrollResponse>(`/courses/${encodeURIComponent(slug)}/enroll/`, {
    method: "DELETE",
    signal,
  });
}
