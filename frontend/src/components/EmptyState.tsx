import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export type EmptyStateTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface EmptyStateProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: EmptyStateTone;
  /** Heading level for the title; keeps the document outline correct. */
  headingLevel?: 1 | 2 | 3;
  className?: string;
  "data-testid"?: string;
}

/** Centered status block: expired, error, success and "nothing yet" states. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  headingLevel = 2,
  className,
  "data-testid": testId,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-testid={testId}>
      <span className={[styles.badge, styles[tone]].join(" ")}>{icon}</span>
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
