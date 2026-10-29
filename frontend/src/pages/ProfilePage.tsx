import { Navigate } from "react-router-dom";
import { CoursesError } from "../features/courses/CoursesStatus";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { PROFILE_COPY } from "../features/profile/copy";
import { MyCourses } from "../features/profile/MyCourses";
import { ProfileHeader } from "../features/profile/ProfileHeader";
import { ProfileLoading } from "../features/profile/ProfileStatus";
import { loginWithNext, ROUTES } from "../router/paths";
import styles from "../features/profile/Profile.module.css";

/**
 * "/profile" — the signed-in user's own page. Guarded here, on the session
 * SiteLayout already loads:
 *   loading       → skeleton (no flash of content, no early bounce to /login)
 *   guest         → /login?next=/profile — or home, right after signing out here
 *   error         → error + retry; a flaky /me is not proof of "signed out"
 *   authenticated → the profile
 */
export function ProfilePage() {
  const session = useCurrentUser();

  if (session.status === "guest") {
    const to = session.signOutStatus === "succeeded" ? ROUTES.home : loginWithNext(ROUTES.profile);
    return <Navigate to={to} replace />;
  }

  return (
    <div className={styles.page} data-testid="profile-page" data-status={session.status}>
      <title>{PROFILE_COPY.pageTitle}</title>
      {session.status === "loading" && <ProfileLoading />}
      {session.status === "error" && (
        <CoursesError
          error={session.error}
          onRetry={session.retry}
          headingLevel={1}
          testId="profile-error"
        />
      )}
      {session.status === "authenticated" && (
        <>
          <ProfileHeader user={session.user} />
          <MyCourses />
        </>
      )}
    </div>
  );
}
