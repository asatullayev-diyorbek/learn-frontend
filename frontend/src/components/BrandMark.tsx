import styles from "./BrandMark.module.css";

export function BrandMark() {
  return (
    <span className={styles.brand}>
      <span className={styles.markWrapper}>
        <svg className={styles.mark} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
          <rect width="32" height="32" rx="10" fill="url(#brandGrad)" />
          <path
            d="M10 9v14h12"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="11" r="2.5" fill="#60a5fa" />
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className={styles.textGroup}>
        <span className={styles.wordmark}>Learn</span>
        <span className={styles.badge}>PRO</span>
      </span>
    </span>
  );
}
