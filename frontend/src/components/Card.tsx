import type { ComponentProps } from "react";
import styles from "./Card.module.css";

export interface CardProps extends ComponentProps<"div"> {
  /** "flush" drops border and padding on small screens (full-bleed mobile layout). */
  mobile?: "card" | "flush";
}

export function Card({ mobile = "card", className, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, mobile === "flush" && styles.flushOnMobile, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
