import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "../../components/icons";
import { ROUTES } from "../../router/paths";
import type { CourseDetail, CourseInstructor } from "../../types/api";
import { CourseCover } from "./CourseCover";
import { EnrolledCount, LevelBadge } from "./CourseMeta";
import { COURSE_DETAIL_COPY } from "./copy";
import { EnrollPanel, type EnrollPanelProps } from "./EnrollPanel";
import { initials } from "./format";
import styles from "./CourseDetail.module.css";

/** Plain-text description → paragraphs on blank lines; single newlines kept. Never HTML. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function BackToCourses() {
  return (
    <Link to={ROUTES.courses} className={styles.back}>
      <ArrowLeftIcon size={16} />
      {COURSE_DETAIL_COPY.back}
    </Link>
  );
}

function InstructorCard({ instructor }: { instructor: CourseInstructor }) {
  const title = instructor.title?.trim();
  const bio = instructor.bio?.trim();
  return (
    <section className={styles.instructor} aria-labelledby="instructor-heading" data-testid="course-instructor-card">
      <h2 id="instructor-heading" className={styles.asideHeading}>
        {COURSE_DETAIL_COPY.instructor}
      </h2>
      <div className={styles.instructorRow}>
        <span className={styles.avatar} aria-hidden="true">
          {initials(instructor.full_name, "?")}
        </span>
        <div className={styles.instructorText}>
          <p className={styles.instructorName}>{instructor.full_name}</p>
          {title && <p className={styles.instructorTitle}>{title}</p>}
        </div>
      </div>
      {bio && <p className={styles.instructorBio}>{bio}</p>}
    </section>
  );
}

export function CourseDetailView({
  course,
  onEnrollmentChanged,
}: {
  course: CourseDetail;
  onEnrollmentChanged: EnrollPanelProps["onChanged"];
}) {
  const description = paragraphs(course.description);

  return (
    <article className={styles.layout} data-testid="course-detail">
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.category}>{course.category.name}</span>
          <LevelBadge level={course.level} />
        </div>
        <h1 className={styles.title}>{course.title}</h1>
        {course.summary && <p className={styles.summary}>{course.summary}</p>}
        <div className={styles.meta}>
          <span className={styles.metaInstructor}>{course.instructor.full_name}</span>
          <span className={styles.metaDivider} aria-hidden="true" />
          <EnrolledCount count={course.enrolled_count} />
        </div>
      </header>

      <CourseCover
        title={course.title}
        imageUrl={course.cover_image_url}
        size="hero"
        className={styles.cover}
      />

      <aside className={styles.aside}>
        <EnrollPanel key={course.slug} course={course} onChanged={onEnrollmentChanged} />
        <InstructorCard instructor={course.instructor} />
      </aside>

      {description.length > 0 && (
        <section className={styles.body} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionTitle}>
            {COURSE_DETAIL_COPY.about}
          </h2>
          <div className={styles.description} data-testid="course-description">
            {description.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
