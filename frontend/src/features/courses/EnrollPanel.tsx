import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button, ButtonRouterLink } from "../../components/Button";
import { CheckIcon, TelegramIcon } from "../../components/icons";
import { LiveRegion } from "../../components/LiveRegion";
import { Skeleton } from "../../components/Skeleton";
import { ROUTES } from "../../router/paths";
import type { CourseDetail } from "../../types/api";
import { ACCOUNT_COPY } from "../auth/copy";
import { useCurrentUser } from "../auth/useCurrentUser";
import { COURSE_DETAIL_COPY, ENROLL_ERROR_COPY } from "./copy";
import { useEnrollment, type EnrollmentState } from "./useEnrollment";
import styles from "./CourseDetail.module.css";

const COPY = COURSE_DETAIL_COPY.enroll;

function announcement(state: EnrollmentState): string {
  if (state.status === "done") {
    return state.action === "enroll" ? COPY.announceEnrolled : COPY.announceUnenrolled;
  }
  if (state.status === "error") return ENROLL_ERROR_COPY[state.error];
  return "";
}

export interface EnrollPanelProps {
  course: CourseDetail;
  onChanged: (patch: Pick<CourseDetail, "is_enrolled" | "enrolled_count">) => void;
}

/**
 * The course's one call to action, driven by who is signed in:
 *   guest (or /me unknown) → honest "sign in to enroll" link
 *   signed in              → "Kursga yozilish" (primary)
 *   enrolled               → "Yozilgansiz" + a quieter secondary "Kursdan chiqish"
 */
export function EnrollPanel({ course, onChanged }: EnrollPanelProps) {
  const session = useCurrentUser();
  const { state, toggle } = useEnrollment(course, onChanged);
  const actionRef = useRef<HTMLButtonElement>(null);
  const pending = state.status === "pending";

  // The enroll and unenroll buttons are different elements; after a flip,
  // hand focus to the one that replaced the button the user just pressed.
  useEffect(() => {
    if (state.status !== "done" && state.status !== "error") return;
    const active = document.activeElement;
    if (!active || active === document.body) actionRef.current?.focus();
  }, [state]);

  return (
    <section className={styles.panel} aria-labelledby="enroll-heading" data-testid="enroll-panel">
      <h2 id="enroll-heading" className="sr-only">
        {COPY.heading}
      </h2>

      {session.status === "loading" && (
        <div aria-busy="true" data-testid="enroll-checking">
          <span className="sr-only">{COPY.checking}</span>
          <Skeleton width="100%" height="var(--control-height-lg)" radius="md" />
        </div>
      )}

      {(session.status === "guest" || session.status === "error") && (
        <div className={styles.panelStack} data-testid="enroll-guest">
          <ButtonRouterLink
            to={ROUTES.login}
            variant="primary"
            size="lg"
            fullWidth
            leadingIcon={<TelegramIcon size={20} />}
          >
            {COPY.guestCta}
          </ButtonRouterLink>
          <p className={styles.panelNote}>{COPY.guestNote}</p>
        </div>
      )}

      {session.status === "authenticated" && (
        <div className={styles.panelStack} data-testid="enroll-member" data-enrolled={course.is_enrolled}>
          {course.is_enrolled ? (
            <>
              <p className={styles.enrolledStatus} data-testid="enrolled-status">
                <span className={styles.enrolledIcon}>
                  <CheckIcon size={18} />
                </span>
                <span>
                  <span className={styles.enrolledTitle}>{COPY.enrolled}</span>
                  <span className={styles.enrolledNote}>{COPY.enrolledNote}</span>
                </span>
              </p>
              <Button
                ref={actionRef}
                variant="secondary"
                fullWidth
                loading={pending}
                onClick={() => void toggle()}
              >
                {pending ? COPY.unenrolling : COPY.unenroll}
              </Button>
            </>
          ) : (
            <Button
              ref={actionRef}
              variant="primary"
              size="lg"
              fullWidth
              loading={pending}
              onClick={() => void toggle()}
            >
              {pending ? COPY.enrolling : COPY.enroll}
            </Button>
          )}

          {state.status === "error" && (
            <div data-testid="enroll-error">
              <Alert tone="danger">
                {ENROLL_ERROR_COPY[state.error]}
                {state.error === "not_authenticated" && (
                  <>
                    {" "}
                    <Link to={ROUTES.login} className={styles.inlineLink}>
                      {ACCOUNT_COPY.signIn}
                    </Link>
                  </>
                )}
              </Alert>
            </div>
          )}
        </div>
      )}

      <LiveRegion message={announcement(state)} />
    </section>
  );
}
