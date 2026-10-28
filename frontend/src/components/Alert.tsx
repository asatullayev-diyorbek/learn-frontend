import type { ReactNode } from "react";
import { AlertCircleIcon, CheckIcon, WifiOffIcon } from "./icons";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "danger";

const DEFAULT_ICONS: Record<AlertTone, ReactNode> = {
  info: <AlertCircleIcon size={18} />,
  success: <CheckIcon size={18} />,
  warning: <WifiOffIcon size={18} />,
  danger: <AlertCircleIcon size={18} />,
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Inline, non-blocking message. Purely visual: announcements to assistive
 * tech go through the page's LiveRegion so nothing is read out twice.
 */
export function Alert({ tone = "info", title, children, icon, className, id }: AlertProps) {
  return (
    <div id={id} className={[styles.alert, styles[tone], className].filter(Boolean).join(" ")}>
      <span className={styles.icon}>{icon ?? DEFAULT_ICONS[tone]}</span>
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
    </div>
  );
}
