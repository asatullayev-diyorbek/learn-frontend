import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveRegion } from "../components/LiveRegion";
import { AuthLayout } from "../layouts/AuthLayout";
import { deriveAnnouncement } from "../features/auth/announcement";
import { AuthTabs, type AuthMethod } from "../features/auth/AuthTabs";
import { AUTH_COPY } from "../features/auth/copy";
import { SignedInState } from "../features/auth/SignedInState";
import { useCodeLogin } from "../features/auth/useCodeLogin";
import { useTokenLogin } from "../features/auth/useTokenLogin";
import { ROUTES } from "../router/paths";

/** Long enough to register the success state, short enough not to feel slow. */
const REDIRECT_DELAY_MS = 900;

export function LoginPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<AuthMethod>("token");
  const codeLogin = useCodeLogin();
  const signedInByCode = codeLogin.view.status === "success";
  const tokenLogin = useTokenLogin({ paused: signedInByCode });
  const signedIn = signedInByCode || tokenLogin.view.status === "confirmed";

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
      title={signedIn ? undefined : AUTH_COPY.title}
      description={signedIn ? undefined : AUTH_COPY.subtitle}
      aside={
        <LiveRegion
          message={deriveAnnouncement(method, tokenLogin.view, codeLogin.view, signedIn)}
        />
      }
    >
      <title>{AUTH_COPY.pageTitle}</title>
      {signedIn ? (
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
