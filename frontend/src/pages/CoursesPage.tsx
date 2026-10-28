import { CourseCatalog } from "../features/courses/CourseCatalog";
import { CourseFilters } from "../features/courses/CourseFilters";
import { COURSES_COPY } from "../features/courses/copy";
import { useCategories } from "../features/courses/useCategories";
import { useCourseFilters } from "../features/courses/useCourseFilters";
import { useCourseList } from "../features/courses/useCourseList";
import styles from "../features/courses/Courses.module.css";

/** "/courses" — the public catalog: filters (in the URL) + results. */
export function CoursesPage() {
  const { filters, setFilters, clearFilters, hasFilters } = useCourseFilters();
  const categories = useCategories();
  const list = useCourseList(filters);

  return (
    <div className={styles.page} data-testid="courses-page">
      <title>{COURSES_COPY.pageTitle}</title>
      <h1 className={styles.pageTitle}>{COURSES_COPY.title}</h1>
      <p className={styles.pageLead}>{COURSES_COPY.lead}</p>

      <CourseFilters
        filters={filters}
        onChange={setFilters}
        categories={categories.state}
        onRetryCategories={categories.retry}
      />

      <CourseCatalog
        view={list.view}
        filtered={hasFilters}
        onRetry={list.retry}
        onLoadMore={list.loadMore}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
