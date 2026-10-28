/*
 * Catalog filters live in the URL (?category=&level=&search=), so a filtered
 * view is shareable and bookmarkable. Changes *replace* the history entry —
 * clicking through filters must not bury the previous page under dozens of
 * back-button steps.
 */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { CourseLevel } from "../../types/api";
import type { CourseListParams } from "../../services/api/courses";
import { COURSE_LEVELS } from "./copy";

export interface CourseFilters {
  /** Category slug; "" = all. */
  category: string;
  /** "" = all levels. */
  level: CourseLevel | "";
  /** Trimmed; "" = no search. */
  search: string;
}

const KEYS = ["category", "level", "search"] as const;

function parseLevel(raw: string | null): CourseLevel | "" {
  return COURSE_LEVELS.find((level) => level === raw) ?? "";
}

export function useCourseFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category")?.trim() ?? "";
  const level = parseLevel(searchParams.get("level"));
  const search = searchParams.get("search")?.trim() ?? "";

  const filters = useMemo<CourseFilters>(
    () => ({ category, level, search }),
    [category, level, search],
  );

  const setFilters = useCallback(
    (patch: Partial<CourseFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const key of KEYS) {
            if (!(key in patch)) continue;
            const value = patch[key]?.trim() ?? "";
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(
    () => setFilters({ category: "", level: "", search: "" }),
    [setFilters],
  );

  const hasFilters = Boolean(category || level || search);

  return { filters, setFilters, clearFilters, hasFilters };
}

/** Stable identity of a filter combination — what a loaded page "belongs to". */
export function filtersKey({ category, level, search }: CourseFilters): string {
  return JSON.stringify([category, level, search]);
}

export function toListParams({ category, level, search }: CourseFilters): CourseListParams {
  return {
    category: category || undefined,
    level: level || undefined,
    search: search || undefined,
  };
}
