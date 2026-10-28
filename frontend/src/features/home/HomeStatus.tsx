import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { AlertCircleIcon, RefreshIcon, WifiOffIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import type { RequestErrorKind } from "../auth/errors";
import { HOME_COPY, HOME_ERROR_COPY } from "./copy";
import styles from "./Home.module.css";

/** Shown while /me is in flight: the shape of a page heading, lead and CTA. */
export function HomeLoading() {
  return (
    <div className={styles.hero} aria-busy="true" data-testid="home-loading">
      <span className="sr-only">{HOME_COPY.loading}</span>
      <Skeleton width={160} height={14} />
      <div className={styles.titleSkeleton}>
        <Skeleton width="min(560px, 92%)" height={32} radius="md" />
        <Skeleton width="min(360px, 64%)" height={32} radius="md" />
      </div>
      <div className={styles.leadSkeleton}>
        <Skeleton width="min(600px, 100%)" height={16} />
        <Skeleton width="min(420px, 80%)" height={16} />
      </div>
      <div className={styles.actions}>
        <Skeleton width={240} height="var(--control-height-lg)" radius="md" />
      </div>
    </div>
  );
}

/**
 * /me failed for a real reason (offline, 5xx) — not "not signed in". Same
 * pattern as the login page's token error: danger EmptyState + retry.
 */
export function HomeError({ error, onRetry }: { error: RequestErrorKind; onRetry: () => void }) {
  const copy = HOME_ERROR_COPY[error];
  return (
    <div className={styles.status}>
      <EmptyState
        data-testid="home-error"
        tone="danger"
        headingLevel={1}
        icon={error === "network" ? <WifiOffIcon size={22} /> : <AlertCircleIcon size={22} />}
        title={copy.title}
        description={copy.description}
        action={
          <Button variant="secondary" leadingIcon={<RefreshIcon size={18} />} onClick={onRetry}>
            {HOME_COPY.retry}
          </Button>
        }
      />
    </div>
  );
}
