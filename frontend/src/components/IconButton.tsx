import type { ComponentProps, ReactNode } from "react";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  /** Required: icon-only controls must have an accessible name. */
  "aria-label": string;
  icon: ReactNode;
  tone?: "neutral" | "success";
}

/** Square 44×44 icon-only button (meets the minimum touch-target size). */
export function IconButton({ icon, tone = "neutral", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={[styles.iconButton, styles[tone], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
    </button>
  );
}
