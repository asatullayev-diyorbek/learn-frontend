import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveRegion } from "../components/LiveRegion";
import { Skeleton } from "../components/Skeleton";
import { AuthLayout } from "../layouts/AuthLayout";
import { deriveAnnouncement } from "../features/auth/announcement";
import { AuthTabs, type AuthMethod } from "../features/auth/AuthTabs";
import { AUTH_COPY } from "../features/auth/copy";
import { CurrentUserProvider } from "../features/auth/CurrentUserProvider";
import { SignedInState } from "../features/auth/SignedInState";
import { useCodeLogin } from "../features/auth/useCodeLogin";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { useTokenLogin } from "../features/auth/useTokenLogin";
import { ROUTES } from "../router/paths";
import styles from "./LoginPage.module.css";

/** Long enough to register the success state, short enough not to feel slow. */
const REDIRECT_DELAY_MS = 900;

/** Owns its own session check: a signed-in browser gets bounced home below. */
export function LoginPage() {
  return (
    <CurrentUserProvider>
      <LoginPageContent />
    </CurrentUserProvider>
  );
}

function LoginPageContent() {
  const navigate = useNavigate();
  const session = useCurrentUser();

  // Fail open: the login form must keep working even if GET /me hiccups, so
  // only an actual "authenticated" answer changes anything here.
  const checkingSession = session.status === "loading";
  const alreadySignedIn = session.status === "authenticated";
  const showGate = checkingSession || alreadySignedIn;

  const [method, setMethod] = useState<AuthMethod>("token");
  const codeLogin = useCodeLogin();
  const signedInByCode = codeLogin.view.status === "success";
  const tokenLogin = useTokenLogin({ paused: showGate || signedInByCode });
  const signedIn = signedInByCode || tokenLogin.view.status === "confirmed";

  useEffect(() => {
    if (!alreadySignedIn) return;
    navigate(ROUTES.home, { replace: true });
  }, [alreadySignedIn, navigate]);

  useEffect(() => {
    if (!signedIn) return;
    const timer = window.setTimeout(
      () => navigate(ROUTES.home, { replace: true, state: { signedIn: true } }),
      REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [signedIn, navigate]);

  return (
    <AuthLayout
      title={showGate || signedIn ? undefined : AUTH_COPY.title}
      description={showGate || signedIn ? undefined : AUTH_COPY.subtitle}
      aside={
        !showGate && (
          <LiveRegion
            message={deriveAnnouncement(method, tokenLogin.view, codeLogin.view, signedIn)}
          />
        )
      }
    >
      <title>{AUTH_COPY.pageTitle}</title>
      {showGate ? (
        <div className={styles.gateSkeleton} aria-hidden="true" data-testid="login-gate-skeleton">
          <Skeleton width="55%" height={20} />
          <Skeleton width="100%" height={44} radius="md" />
          <Skeleton width="100%" height={120} radius="md" />
        </div>
      ) : signedIn ? (
        <SignedInState />
      ) : (
        <AuthTabs
          method={method}
          onMethodChange={setMethod}
          tokenLogin={tokenLogin}
          codeLogin={codeLogin}
        />
      )}
    </AuthLayout>
  );
}
