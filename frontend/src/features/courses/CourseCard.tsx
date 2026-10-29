import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";
import type { CourseListItem } from "../../types/api";
import { CourseCover } from "./CourseCover";
import { EnrolledBadge, EnrolledCount, LevelBadge } from "./CourseMeta";
import styles from "./CourseCard.module.css";

/**
 * One catalog card. The title is the only link; it stretches over the whole
 * card, so the card is one click/tap target but is announced by its title
 * alone rather than as one long run-on link.
 */
export function CourseCard({
  course,
  headingLevel = 2,
}: {
  course: CourseListItem;
  /** 3 where the grid sits under its own h2 (the profile page's "Mening kurslarim"). */
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={styles.card} data-testid="course-card" data-slug={course.slug}>
      <div className={styles.media}>
        <CourseCover title={course.title} imageUrl={course.cover_image_url} />
        {course.is_enrolled && (
          <span className={styles.mediaBadge}>
            <EnrolledBadge />
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.topline}>
          <span className={styles.category}>{course.category.name}</span>
          <LevelBadge level={course.level} />
        </div>

        <Heading className={styles.title}>
          <Link to={ROUTES.courseDetail(course.slug)} className={styles.link} data-course-link>
            {course.title}
          </Link>
        </Heading>

        {course.summary && <p className={styles.summary}>{course.summary}</p>}

        <div className={styles.footer}>
          <span className={styles.instructor} data-testid="course-instructor">
            {course.instructor.full_name}
          </span>
          <EnrolledCount count={course.enrolled_count} />
        </div>
      </div>
    </article>
  );
}
