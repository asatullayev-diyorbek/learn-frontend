import { CheckIcon, UsersIcon } from "../../components/icons";
import type { CourseLevel } from "../../types/api";
import { COURSES_COPY, LEVEL_LABELS } from "./copy";
import styles from "./CourseMeta.module.css";

/** Small neutral pill: "Boshlang‘ich" / "O‘rta" / "Yuqori". */
export function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span className={styles.badge} data-testid="course-level">
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}

/** "Yozilgansiz" pill for courses the signed-in user is enrolled in. */
export function EnrolledBadge() {
  return (
    <span className={[styles.badge, styles.enrolled].join(" ")} data-testid="course-enrolled-badge">
      <CheckIcon size={14} />
      {COURSES_COPY.enrolledBadge}
    </span>
  );
}

/** "12 ta o‘quvchi" with an icon. */
export function EnrolledCount({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={[styles.count, className].filter(Boolean).join(" ")}
      data-testid="course-enrolled-count"
    >
      <UsersIcon size={16} className={styles.countIcon} />
      {COURSES_COPY.students(count)}
    </span>
  );
}
