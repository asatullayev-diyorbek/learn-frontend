import { Button, ButtonLink } from "../../components/Button";
import { CopyField } from "../../components/CopyField";
import { EmptyState } from "../../components/EmptyState";
import {
  AlertCircleIcon,
  ClockIcon,
  ExternalIcon,
  RefreshIcon,
  TelegramIcon,
  WifiOffIcon,
} from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { formatCountdown, useCountdown } from "../../hooks/useCountdown";
import { AUTH_COPY, TOKEN_ERROR_COPY } from "./copy";
import type { TokenView } from "./useTokenLogin";
import styles from "./LoginPanels.module.css";

const COPY = AUTH_COPY.token;
const URGENT_BELOW_SECONDS = 60;

export interface TokenLoginPanelProps {
  view: TokenView;
  onRetry: () => void;
}

export function TokenLoginPanel({ view, onRetry }: TokenLoginPanelProps) {
  switch (view.status) {
    case "loading":
      return <TokenLoadingState />;
    case "ready":
      return <TokenReadyState view={view} />;
    case "expired":
      return (
        <EmptyState
          data-testid="token-expired"
          tone="warning"
          icon={<ClockIcon size={22} />}
          title={COPY.expiredTitle}
          description={COPY.expiredDescription}
          action={
            <Button variant="primary" leadingIcon={<RefreshIcon size={18} />} onClick={onRetry}>
              {COPY.expiredAction}
            </Button>
          }
        />
      );
    case "error": {
      const copy = TOKEN_ERROR_COPY[view.error];
      return (
        <EmptyState
          data-testid="token-error"
          tone="danger"
          icon={view.error === "network" ? <WifiOffIcon size={22} /> : <AlertCircleIcon size={22} />}
          title={copy.title}
          description={copy.description}
          action={
            <Button variant="secondary" leadingIcon={<RefreshIcon size={18} />} onClick={onRetry}>
              {COPY.retry}
            </Button>
          }
        />
      );
    }
    case "confirmed":
      // The page swaps the whole card body for the success state.
      return null;
  }
}

/** Mirrors the ready layout 1:1 so nothing shifts when the token arrives. */
function TokenLoadingState() {
  return (
    <div className={styles.stack} aria-busy="true" data-testid="token-loading">
      <span className="sr-only">{COPY.loading}</span>
      <div className={styles.leadSkeleton}>
        <Skeleton height={14} width="92%" />
        <Skeleton height={14} width="64%" />
      </div>
      <Skeleton height="var(--control-height-lg)" radius="md" />
      <div className={styles.statusRow}>
        <Skeleton height={12} width={150} />
        <Skeleton height={12} width={48} />
      </div>
      <div className={styles.divider} aria-hidden="true" />
      <div className={styles.fieldSkeleton}>
        <Skeleton height={12} width={96} />
        <Skeleton height="var(--control-height-md)" radius="md" />
      </div>
    </div>
  );
}

function TokenReadyState({ view }: { view: Extract<TokenView, { status: "ready" }> }) {
  const secondsLeft = useCountdown(view.deadline);
  const urgent = secondsLeft <= URGENT_BELOW_SECONDS;

  return (
    <div className={styles.stack} data-testid="token-ready">
      <p className={styles.lead}>{COPY.lead}</p>

      <ButtonLink
        variant="primary"
        size="lg"
        fullWidth
        href={view.deepLink}
        target="_blank"
        rel="noopener noreferrer"
        leadingIcon={<TelegramIcon size={20} />}
        trailingIcon={<ExternalIcon size={16} className={styles.externalIcon} />}
      >
        {COPY.openBot}
      </ButtonLink>

      <div className={styles.statusRow}>
        {view.connectionLost ? (
          <span className={`${styles.status} ${styles.statusWarning}`}>
            <WifiOffIcon size={16} />
            {COPY.reconnecting}
          </span>
        ) : (
          <span className={styles.status}>
            <span className={styles.pulse} aria-hidden="true" />
            {COPY.waiting}
          </span>
        )}
        <span className={styles.timer} data-urgent={urgent || undefined} data-testid="token-countdown">
          <ClockIcon size={15} />
          <span className="sr-only">{COPY.timeLeft} </span>
          <time dateTime={`PT${secondsLeft}S`}>{formatCountdown(secondsLeft)}</time>
        </span>
      </div>

      <div className={styles.divider}>
        <span>{COPY.fallbackDivider}</span>
      </div>

      <div className={styles.fieldGroup}>
        <CopyField
          label={COPY.tokenLabel}
          value={view.token}
          copyLabel={AUTH_COPY.copy.copy}
          copiedLabel={AUTH_COPY.copy.copied}
        />
        <p className={styles.hint}>{COPY.tokenHint}</p>
      </div>
    </div>
  );
}
