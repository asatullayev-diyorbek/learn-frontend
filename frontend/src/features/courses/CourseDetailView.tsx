import { Link } from "react-router-dom";
import { ArrowLeftIcon, PlayIcon, TelegramIcon, VideoIcon } from "../../components/icons";
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

      <div className={styles.body}>
        {description.length > 0 && (
          <section className={styles.contentSection} aria-labelledby="about-heading">
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

        {course.topics.length > 0 && (
          <section className={styles.contentSection} aria-labelledby="topics-heading" data-testid="course-topics">
            <div className={styles.topicsHeader}>
              <h2 id="topics-heading" className={styles.sectionTitle}>
                {COURSE_DETAIL_COPY.topics}
              </h2>
              <span className={styles.topicsCountBadge}>
                <PlayIcon size={12} />
                {course.topics.length} ta dars mavzusi
              </span>
            </div>

            <ol className={styles.topicList}>
              {course.topics.map((topic) => (
                <li key={topic.id} className={styles.topicItem}>
                  {topic.title}
                </li>
              ))}
            </ol>

            <div className={styles.contributeCallout}>
              <div className={styles.contributeText}>
                <span className={styles.contributeIcon}>
                  <VideoIcon size={18} />
                </span>
                <div>
                  <strong>Ushbu mavzulardan biriga video darslik tayyorladingizmi?</strong>
                  <p>
                    Videongizni Telegram botga yuboring va «Mening videolarim» sahifasida shu kurs mavzusiga biriktiring.
                  </p>
                </div>
              </div>
              <div className={styles.contributeActions}>
                <Link to={ROUTES.videos} className={styles.contributeLink} tabIndex={-1}>
                  <VideoIcon size={15} />
                  <span>Mavzuga video biriktirish</span>
                </Link>
                <a
                  href="https://t.me/learn_asatullayev_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contributeBotLink}
                  tabIndex={-1}
                >
                  <TelegramIcon size={15} />
                  <span>Botga yuborish</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
