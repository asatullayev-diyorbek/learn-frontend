import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { AlertCircleIcon, BookIcon, RefreshIcon, SearchIcon, WifiOffIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import type { RequestErrorKind } from "../auth/errors";
import { COURSES_COPY, COURSES_ERROR_COPY } from "./copy";
import cardStyles from "./CourseCard.module.css";
import styles from "./Courses.module.css";

/** Same grid, same card frame as the real results — nothing jumps on resolve. */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" data-testid="courses-loading">
      <span className="sr-only">{COURSES_COPY.loading}</span>
      <div className={styles.resultsBar} aria-hidden="true">
        <Skeleton width={72} height={14} />
      </div>
      <ul className={styles.grid} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={styles.gridItem}>
            <div className={cardStyles.card}>
              <Skeleton width="100%" height="auto" radius="md" className={styles.coverSkeleton} />
              <div className={[cardStyles.body, styles.cardSkeletonBody].join(" ")}>
                <Skeleton width="40%" height={14} />
                <Skeleton width="85%" height={20} radius="md" />
                <Skeleton width="100%" height={14} />
                <Skeleton width="70%" height={14} />
                <div className={styles.cardSkeletonFooter}>
                  <Skeleton width="38%" height={14} />
                  <Skeleton width="24%" height={14} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Filters matched nothing (or the catalog is genuinely empty). */
export function CoursesEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className={styles.status}>
      <EmptyState
        data-testid="courses-empty-results"
        tone={filtered ? "neutral" : "accent"}
        icon={filtered ? <SearchIcon size={22} /> : <BookIcon size={22} />}
        title={filtered ? COURSES_COPY.emptyTitle : COURSES_COPY.emptyCatalogTitle}
        description={filtered ? COURSES_COPY.emptyDescription : COURSES_COPY.emptyCatalogDescription}
        action={
          filtered && (
            <Button variant="secondary" onClick={onClear}>
              {COURSES_COPY.clearFilters}
            </Button>
          )
        }
      />
    </div>
  );
}

/** Network / server failure — same danger EmptyState + retry as home and login. */
export function CoursesError({
  error,
  onRetry,
  headingLevel = 2,
  testId = "courses-error",
}: {
  error: RequestErrorKind;
  onRetry: () => void;
  headingLevel?: 1 | 2 | 3;
  testId?: string;
}) {
  const copy = COURSES_ERROR_COPY[error];
  return (
    <div className={styles.status}>
      <EmptyState
        data-testid={testId}
        tone="danger"
        headingLevel={headingLevel}
        icon={error === "network" ? <WifiOffIcon size={22} /> : <AlertCircleIcon size={22} />}
        title={copy.title}
        description={copy.description}
        action={
          <Button variant="secondary" leadingIcon={<RefreshIcon size={18} />} onClick={onRetry}>
            {COURSES_COPY.retry}
          </Button>
        }
      />
    </div>
  );
}
