import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  radius?: "sm" | "md" | "full";
  className?: string;
}

/** Placeholder block shown while content loads. Always aria-hidden. */
export function Skeleton({ width = "100%", height = 16, radius = "sm", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.skeleton, styles[radius], className].filter(Boolean).join(" ")}
      style={{ width, height }}
    />
  );
}
