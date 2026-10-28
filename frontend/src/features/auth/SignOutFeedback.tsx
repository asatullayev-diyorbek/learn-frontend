import { Alert } from "../../components/Alert";
import { LiveRegion } from "../../components/LiveRegion";
import { ACCOUNT_COPY } from "./copy";
import { useCurrentUser } from "./useCurrentUser";

/**
 * Sign-out is the one dynamic status on site pages: announce its outcome, and
 * show a visible alert if it failed (the user is still signed in then).
 */
export function SignOutFeedback({ className }: { className?: string }) {
  const { signOutStatus } = useCurrentUser();

  const message =
    signOutStatus === "succeeded"
      ? ACCOUNT_COPY.signedOut
      : signOutStatus === "failed"
        ? `${ACCOUNT_COPY.signOutFailedTitle}. ${ACCOUNT_COPY.signOutFailedDescription}`
        : "";

  return (
    <>
      <LiveRegion message={message} />
      {signOutStatus === "failed" && (
        <Alert tone="danger" title={ACCOUNT_COPY.signOutFailedTitle} className={className}>
          {ACCOUNT_COPY.signOutFailedDescription}
        </Alert>
      )}
    </>
  );
}
