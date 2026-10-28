import type { ReactNode } from "react";
import { BrandMark } from "../components/BrandMark";
import { Card } from "../components/Card";
import styles from "./AuthLayout.module.css";

export interface AuthLayoutProps {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Rendered outside the card (e.g. a page-level aria-live region). */
  aside?: ReactNode;
}

/**
 * Shared shell for auth and auth-adjacent pages: brand header + one centred
 * card on desktop, full-bleed content with a 16px gutter on mobile.
 */
export function AuthLayout({ title, description, children, aside }: AuthLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <BrandMark />
      </header>

      <main className={styles.main}>
        <Card mobile="flush" className={styles.card}>
          {(title || description) && (
            <div className={styles.intro}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
          )}
          {children}
        </Card>
      </main>

      {aside}
    </div>
  );
}
