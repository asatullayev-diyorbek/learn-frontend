import { ButtonRouterLink } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ArrowLeftIcon, SearchIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { ROUTES } from "../../router/paths";
import { COURSE_DETAIL_COPY } from "./copy";
import courseStyles from "./Courses.module.css";
import styles from "./CourseDetail.module.css";

/** Shape of the real layout: header lines, cover, aside panel, description. */
export function CourseDetailLoading() {
  return (
    <div className={styles.layout} aria-busy="true" data-testid="course-detail-loading">
      <span className="sr-only">{COURSE_DETAIL_COPY.loading}</span>
      <div className={styles.header} aria-hidden="true">
        <Skeleton width={160} height={14} />
        <div className={styles.skeletonTitle}>
          <Skeleton width="min(520px, 90%)" height={30} radius="md" />
        </div>
        <div className={styles.skeletonLines}>
          <Skeleton width="min(600px, 100%)" height={16} />
          <Skeleton width="min(420px, 75%)" height={16} />
        </div>
      </div>
      <Skeleton width="100%" height="auto" radius="md" className={[styles.cover, styles.coverSkeleton].join(" ")} />
      <div className={styles.aside} aria-hidden="true">
        <div className={styles.panel}>
          <Skeleton width="100%" height="var(--control-height-lg)" radius="md" />
        </div>
      </div>
    </div>
  );
}

/** 404 — a dead link, not an outage: no retry, a way back to the catalog. */
export function CourseNotFound() {
  return (
    <div className={courseStyles.status}>
      <EmptyState
        data-testid="course-not-found"
        tone="neutral"
        headingLevel={1}
        icon={<SearchIcon size={22} />}
        title={COURSE_DETAIL_COPY.notFoundTitle}
        description={COURSE_DETAIL_COPY.notFoundDescription}
        action={
          <ButtonRouterLink
            to={ROUTES.courses}
            variant="secondary"
            leadingIcon={<ArrowLeftIcon size={18} />}
          >
            {COURSE_DETAIL_COPY.notFoundAction}
          </ButtonRouterLink>
        }
      />
    </div>
  );
}
