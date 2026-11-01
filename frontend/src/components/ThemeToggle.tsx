import { MoonIcon, SunIcon } from "./icons";
import { useTheme } from "../hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      tabIndex={-1}
      aria-label={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
      title={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
    >
      <span className={styles.iconWrapper}>
        {isDark ? <SunIcon size={18} className={styles.sun} /> : <MoonIcon size={18} className={styles.moon} />}
      </span>
      <span className={styles.label}>{isDark ? "Kunduzgi" : "Tungi"}</span>
    </button>
  );
}

