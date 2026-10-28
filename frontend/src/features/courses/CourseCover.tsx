import { useState } from "react";
import { initials } from "./format";
import styles from "./CourseCover.module.css";

export interface CourseCoverProps {
  title: string;
  imageUrl: string;
  size?: "card" | "hero";
  className?: string;
}

/**
 * 16:9 course cover. With no URL — or one that fails to load — it falls back
 * to the title's initials on an accent tint, never a broken-image icon.
 * Decorative either way: the title is always rendered next to it.
 */
export function CourseCover({ title, imageUrl, size = "card", className }: CourseCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div
      className={[styles.cover, styles[size], className].filter(Boolean).join(" ")}
      data-testid="course-cover"
      data-placeholder={showImage ? undefined : true}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials(title)}
        </span>
      )}
    </div>
  );
}
