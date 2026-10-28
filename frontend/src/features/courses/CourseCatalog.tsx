import { useEffect, useRef } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { LiveRegion } from "../../components/LiveRegion";
import { Spinner } from "../../components/Spinner";
import { CourseCard } from "./CourseCard";
import { CoursesEmpty, CoursesError, CourseGridSkeleton } from "./CoursesStatus";
import { COURSES_COPY, COURSES_ERROR_COPY } from "./copy";
import type { CourseListView } from "./useCourseList";
import styles from "./Courses.module.css";

/** What a screen reader hears when the results settle — nothing while in flight. */
function announcement(view: CourseListView, filtered: boolean): string {
  if (view.status === "error") return COURSES_ERROR_COPY[view.error].title;
  if (view.status !== "ready" || view.refreshing) return "";
  if (view.loadMore.status === "done") return COURSES_COPY.loadedMore(view.loadMore.added);
  if (view.loadMore.status === "error") return COURSES_COPY.loadMoreFailed;
  if (view.count === 0) return filtered ? COURSES_COPY.emptyTitle : COURSES_COPY.emptyCatalogTitle;
  return COURSES_COPY.found(view.count);
}

/** Focus is still on the load-more button, or was dropped on <body> while it was disabled. */
function focusIsIdle(button: HTMLButtonElement | null): boolean {
  const active = document.activeElement;
  return !active || active === document.body || active === button;
}

export interface CourseCatalogProps {
  view: CourseListView;
  filtered: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  onClearFilters: () => void;
}

/** Results area: skeleton → grid (+ load more) / empty / error. */
export function CourseCatalog({ view, filtered, onRetry, onLoadMore, onClearFilters }: CourseCatalogProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const loadMore = view.status === "ready" ? view.loadMore : null;

  // After "Yana yuklash", move focus to the first new card: the button may
  // disappear (last page), and either way that is where reading continues.
  useEffect(() => {
    if (loadMore?.status !== "done" || loadMore.added === 0 || !focusIsIdle(moreButtonRef.current)) {
      return;
    }
    const links = gridRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-course-link]");
    links?.[loadMore.firstNewIndex]?.focus();
  }, [loadMore]);

  // A failed page leaves the (briefly disabled) button as the retry: put
  // focus back on it rather than leaving it on <body>.
  useEffect(() => {
    if (loadMore?.status === "error" && focusIsIdle(moreButtonRef.current)) {
      moreButtonRef.current?.focus();
    }
  }, [loadMore]);

  return (
    <div className={styles.results}>
      <LiveRegion message={announcement(view, filtered)} />

      {view.status === "loading" && <CourseGridSkeleton />}

      {view.status === "error" && <CoursesError error={view.error} onRetry={onRetry} />}

      {view.status === "ready" && (
        <div data-testid="courses-results" data-refreshing={view.refreshing || undefined}>
          <div className={styles.resultsBar}>
            <p className={styles.resultsCount} data-testid="courses-count">
              {COURSES_COPY.count(view.count)}
            </p>
            {view.refreshing && (
              <span className={styles.refreshing} data-testid="courses-refreshing">
                <Spinner size={14} />
                {COURSES_COPY.updating}
              </span>
            )}
          </div>

          {view.items.length === 0 ? (
            <div className={styles.dimmable} aria-busy={view.refreshing || undefined}>
              <CoursesEmpty filtered={filtered} onClear={onClearFilters} />
            </div>
          ) : (
            <ul
              ref={gridRef}
              className={[styles.grid, styles.dimmable].join(" ")}
              aria-busy={view.refreshing || undefined}
              data-testid="courses-grid"
            >
              {view.items.map((course) => (
                <li key={course.id} className={styles.gridItem}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          )}

          {(view.hasMore || view.loadMore.status === "error") && (
            <div className={styles.more}>
              {view.loadMore.status === "error" && (
                <Alert tone="danger" className={styles.moreError}>
                  {COURSES_COPY.loadMoreFailed}
                </Alert>
              )}
              {view.hasMore && (
                <Button
                  ref={moreButtonRef}
                  variant="secondary"
                  loading={view.loadMore.status === "loading"}
                  onClick={onLoadMore}
                  data-testid="courses-load-more"
                >
                  {view.loadMore.status === "loading" ? COURSES_COPY.loadingMore : COURSES_COPY.loadMore}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
