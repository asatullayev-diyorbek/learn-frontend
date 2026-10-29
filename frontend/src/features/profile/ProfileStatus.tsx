import { Skeleton } from "../../components/Skeleton";
import { CourseGridSkeleton } from "../courses/CoursesStatus";
import { PROFILE_COPY } from "./copy";
import styles from "./Profile.module.css";

/**
 * While /me is in flight: the profile's own shape (avatar, name, section,
 * course grid), never the real content or a premature redirect to /login.
 */
export function ProfileLoading() {
  return (
    <div aria-busy="true" data-testid="profile-loading">
      <span className="sr-only">{PROFILE_COPY.loading}</span>
      <div className={styles.intro} aria-hidden="true">
        <Skeleton width={64} height={64} radius="full" className={styles.avatarSkeleton} />
        <div className={styles.identitySkeleton}>
          <Skeleton width={56} height={14} />
          <Skeleton width="min(240px, 100%)" height={28} radius="md" />
          <Skeleton width={96} height={16} />
        </div>
      </div>
      <div className={styles.section} aria-hidden="true">
        <Skeleton width={160} height={22} radius="md" />
        <div className={styles.sectionBody}>
          <CourseGridSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
