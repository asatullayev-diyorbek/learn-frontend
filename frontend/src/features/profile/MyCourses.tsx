import { Navigate } from "react-router-dom";
import { ButtonRouterLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { BookIcon } from "../../components/icons";
import { LiveRegion } from "../../components/LiveRegion";
import { loginWithNext, ROUTES } from "../../router/paths";
import { CourseCard } from "../courses/CourseCard";
import { CoursesError, CourseGridSkeleton } from "../courses/CoursesStatus";
import { COURSES_COPY, COURSES_ERROR_COPY } from "../courses/copy";
import { PROFILE_COPY } from "./copy";
import { useMyCourses, type MyCoursesView } from "./useMyCourses";
import coursesStyles from "../courses/Courses.module.css";
import styles from "./Profile.module.css";

const COPY = PROFILE_COPY.myCourses;

/** What a screen reader hears once the list settles — nothing while in flight. */
function announcement(view: MyCoursesView): string {
  if (view.status === "error") return COURSES_ERROR_COPY[view.error].title;
  if (view.status !== "ready") return "";
  return view.courses.length === 0 ? COPY.emptyTitle : COURSES_COPY.count(view.courses.length);
}

/**
 * "Mening kurslarim": the catalog's own grid, cards and skeleton, fed by
 * GET /courses/mine/. Mounted only for a signed-in user.
 */
export function MyCourses() {
  const { view, retry } = useMyCourses();

  // /me said signed in, but the session has since gone: same as the guard.
  if (view.status === "signed_out") return <Navigate to={loginWithNext(ROUTES.profile)} replace />;

  return (
    <section className={styles.section} aria-labelledby="my-courses-title" data-testid="my-courses">
      <h2 id="my-courses-title" className={styles.sectionTitle}>
        {COPY.title}
      </h2>
      <LiveRegion message={announcement(view)} />

      <div className={styles.sectionBody} data-status={view.status}>
        {view.status === "loading" && <CourseGridSkeleton count={3} />}

        {view.status === "error" && (
          <CoursesError error={view.error} onRetry={retry} headingLevel={3} testId="my-courses-error" />
        )}

        {view.status === "ready" && view.courses.length === 0 && (
          <Card className={styles.emptyCard}>
            <EmptyState
              data-testid="my-courses-empty"
              tone="accent"
              headingLevel={3}
              icon={<BookIcon size={22} />}
              title={COPY.emptyTitle}
              description={COPY.emptyDescription}
              action={
                <ButtonRouterLink to={ROUTES.courses} variant="primary">
                  {COPY.emptyAction}
                </ButtonRouterLink>
              }
            />
          </Card>
        )}

        {view.status === "ready" && view.courses.length > 0 && (
          <>
            <div className={coursesStyles.resultsBar}>
              <p className={coursesStyles.resultsCount} data-testid="my-courses-count">
                {COURSES_COPY.count(view.courses.length)}
              </p>
            </div>
            <ul className={coursesStyles.grid} data-testid="my-courses-grid">
              {view.courses.map((course) => (
                <li key={course.id} className={coursesStyles.gridItem}>
                  <CourseCard course={course} headingLevel={3} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
