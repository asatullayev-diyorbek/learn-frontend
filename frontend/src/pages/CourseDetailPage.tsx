import { useParams } from "react-router-dom";
import { CourseDetailLoading, CourseNotFound } from "../features/courses/CourseDetailStatus";
import { BackToCourses, CourseDetailView } from "../features/courses/CourseDetailView";
import { CoursesError } from "../features/courses/CoursesStatus";
import { COURSE_DETAIL_COPY } from "../features/courses/copy";
import { useCourseDetail } from "../features/courses/useCourseDetail";
import styles from "../features/courses/CourseDetail.module.css";

/** "/courses/:slug" — one course, with enrolment. */
export function CourseDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { view, retry, patchCourse } = useCourseDetail(slug);

  return (
    <div className={styles.page} data-testid="course-detail-page" data-status={view.status}>
      <title>
        {view.status === "ready"
          ? COURSE_DETAIL_COPY.pageTitle(view.course.title)
          : view.status === "not_found"
            ? COURSE_DETAIL_COPY.pageTitle(COURSE_DETAIL_COPY.notFoundTitle)
            : COURSE_DETAIL_COPY.loadingTitle}
      </title>

      {view.status !== "not_found" && <BackToCourses />}

      {view.status === "loading" && <CourseDetailLoading />}
      {view.status === "ready" && (
        <CourseDetailView course={view.course} onEnrollmentChanged={patchCourse} />
      )}
      {view.status === "not_found" && <CourseNotFound />}
      {view.status === "error" && (
        <CoursesError error={view.error} onRetry={retry} headingLevel={1} testId="course-error" />
      )}
    </div>
  );
}
