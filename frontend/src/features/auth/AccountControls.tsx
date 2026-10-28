import { useEffect, useRef } from "react";
import { Button, ButtonRouterLink } from "../../components/Button";
import { Skeleton } from "../../components/Skeleton";
import { ROUTES } from "../../router/paths";
import { ACCOUNT_COPY } from "./copy";
import { getDisplayName, useCurrentUser } from "./useCurrentUser";
import styles from "./AccountControls.module.css";

/**
 * Right-hand header slot. Every state renders inside the same fixed-height
 * box, so the header never shifts when /me resolves.
 *
 * "error" falls back to the guest controls: we cannot tell whether a session
 * exists, and signing in again is always safe. The page body shows the retry.
 */
export function AccountControls() {
  const session = useCurrentUser();
  const signInRef = useRef<HTMLAnchorElement>(null);
  const focusSignInNext = useRef(false);

  // After signing out the "Chiqish" button disappears; hand focus to the
  // "Kirish" link that replaces it instead of dropping it on <body>.
  useEffect(() => {
    if (session.status === "guest" && focusSignInNext.current) {
      focusSignInNext.current = false;
      signInRef.current?.focus();
    }
  }, [session.status]);

  const handleSignOut = async () => {
    focusSignInNext.current = true;
    const ok = await session.signOut();
    if (!ok) focusSignInNext.current = false;
  };

  return (
    <div className={styles.slot} data-testid="header-account" data-status={session.status}>
      {session.status === "loading" && (
        <>
          <span className="sr-only">{ACCOUNT_COPY.loading}</span>
          <Skeleton width={96} height="var(--control-height-md)" radius="md" />
        </>
      )}

      {(session.status === "guest" || session.status === "error") && (
        <ButtonRouterLink ref={signInRef} to={ROUTES.login} variant="secondary">
          {ACCOUNT_COPY.signIn}
        </ButtonRouterLink>
      )}

      {session.status === "authenticated" && (
        <>
          <p className={styles.greeting} data-testid="header-greeting">
            <span className={styles.greetingPrefix}>{ACCOUNT_COPY.greeting} </span>
            <span className={styles.name}>{getDisplayName(session.user)}</span>
          </p>
          <Button
            variant="secondary"
            loading={session.signOutStatus === "pending"}
            onClick={() => void handleSignOut()}
          >
            {session.signOutStatus === "pending" ? ACCOUNT_COPY.signingOut : ACCOUNT_COPY.signOut}
          </Button>
        </>
      )}
    </div>
  );
}
