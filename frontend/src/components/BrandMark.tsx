import styles from "./BrandMark.module.css";

/** Learn logo: mark + wordmark. The wordmark is real text (selectable, scalable). */
export function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path
          d="M11 9.5v13h10.5"
          fill="none"
          stroke="var(--color-on-accent)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.wordmark}>Learn</span>
    </span>
  );
}
