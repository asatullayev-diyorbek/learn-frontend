/*
 * Catalog data: page 1 for the current filters, plus "load more" pages
 * appended in place.
 *
 *   loading ──► ready ──(filters change)──► ready + refreshing ──► ready
 *      └──────► error ──(retry)──► loading / refreshing
 *
 * While a filter change is in flight the previous results stay on screen
 * (`refreshing`) instead of flashing back to the skeleton on every keystroke.
 * "Which filters is this data for?" is tracked by key, so every state below
 * is derived during render rather than synchronised in effects.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "../../services/api/client";
import { getCourses, nextPageNumber } from "../../services/api/courses";
import type { CourseListItem } from "../../types/api";
import { classifyRequestError, type RequestErrorKind } from "../auth/errors";
import { filtersKey, toListParams, type CourseFilters } from "./useCourseFilters";

interface LoadedList {
  key: string;
  items: CourseListItem[];
  count: number;
  nextPage: number | null;
}

export type LoadMoreState =
  | { status: "idle" }
  | { status: "loading" }
  /** `added` / `firstNewIndex` let the page announce and focus the new cards. */
  | { status: "done"; added: number; firstNewIndex: number }
  | { status: "error"; error: RequestErrorKind };

export type CourseListView =
  | { status: "loading" }
  | { status: "error"; error: RequestErrorKind }
  | {
      status: "ready";
      items: CourseListItem[];
      count: number;
      hasMore: boolean;
      /** A request for different filters is in flight; these results are the previous ones. */
      refreshing: boolean;
      loadMore: LoadMoreState;
    };

function appendUnique(items: CourseListItem[], more: CourseListItem[]) {
  const seen = new Set(items.map((item) => item.id));
  return [...items, ...more.filter((item) => !seen.has(item.id))];
}

export function useCourseList(filters: CourseFilters) {
  const key = filtersKey(filters);
  const [list, setList] = useState<LoadedList | null>(null);
  const [failure, setFailure] = useState<{ key: string; error: RequestErrorKind } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [more, setMore] = useState<{ key: string; state: LoadMoreState } | null>(null);
  const moreRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const forKey = filtersKey(filters);
    const controller = new AbortController();
    getCourses(toListParams(filters), controller.signal).then(
      (page) => {
        setList({
          key: forKey,
          items: page.results,
          count: page.count,
          nextPage: nextPageNumber(page.next),
        });
        setFailure(null);
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setFailure({ key: forKey, error: classifyRequestError(error) });
      },
    );
    return () => {
      controller.abort();
      // A "load more" for the old filters must never land in the new list.
      moreRequest.current?.abort();
      moreRequest.current = null;
    };
  }, [filters, attempt]);

  const retry = useCallback(() => {
    setFailure(null);
    setAttempt((n) => n + 1);
  }, []);

  const current = list && list.key === key ? list : null;

  const loadMore = useCallback(() => {
    if (!current || current.nextPage === null || moreRequest.current) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    const forKey = current.key;
    const firstNewIndex = current.items.length;
    setMore({ key: forKey, state: { status: "loading" } });

    getCourses({ ...toListParams(filters), page: current.nextPage }, controller.signal)
      .then(
        (page) => {
          setList((prev) =>
            prev && prev.key === forKey
              ? {
                  key: forKey,
                  items: appendUnique(prev.items, page.results),
                  count: page.count,
                  nextPage: nextPageNumber(page.next),
                }
              : prev,
          );
          setMore({
            key: forKey,
            state: { status: "done", added: page.results.length, firstNewIndex },
          });
        },
        (error: unknown) => {
          if (isAbortError(error)) return;
          setMore({ key: forKey, state: { status: "error", error: classifyRequestError(error) } });
        },
      )
      .finally(() => {
        if (moreRequest.current === controller) moreRequest.current = null;
      });
  }, [current, filters]);

  let view: CourseListView;
  if (failure && failure.key === key) {
    view = { status: "error", error: failure.error };
  } else if (!list) {
    view = { status: "loading" };
  } else {
    view = {
      status: "ready",
      items: list.items,
      count: list.count,
      hasMore: current ? current.nextPage !== null : false,
      refreshing: !current,
      loadMore: current && more?.key === key ? more.state : { status: "idle" },
    };
  }

  return { view, retry, loadMore };
}
