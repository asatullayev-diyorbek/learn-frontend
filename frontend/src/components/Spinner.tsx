import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: number;
  /** When set, the spinner is exposed to assistive tech with this label. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 16, label, className }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
