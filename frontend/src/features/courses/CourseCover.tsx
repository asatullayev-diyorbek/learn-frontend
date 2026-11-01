import { useState } from "react";
import { initials } from "./format";
import styles from "./CourseCover.module.css";

export interface CourseCoverProps {
  title: string;
  imageUrl: string;
  size?: "card" | "hero";
  className?: string;
}

const PALETTES = ["blue", "indigo", "teal", "violet", "sky", "emerald"] as const;

function pickPalette(title: string): (typeof PALETTES)[number] {
  const lower = title.toLowerCase();
  if (lower.includes("python") || lower.includes("backend") || lower.includes("api") || lower.includes("django")) {
    return lower.includes("django") ? "indigo" : "blue";
  }
  if (lower.includes("react") || lower.includes("javascript") || lower.includes("typescript") || lower.includes("css") || lower.includes("html")) {
    return lower.includes("css") || lower.includes("html") ? "sky" : "violet";
  }
  if (lower.includes("sql") || lower.includes("postgres") || lower.includes("pandas") || lower.includes("data")) {
    return "teal";
  }
  if (lower.includes("kotlin") || lower.includes("android") || lower.includes("flutter") || lower.includes("mobil")) {
    return "emerald";
  }
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length]!;
}

/**
 * 16:9 course cover. With no URL — or one that fails to load — it falls back
 * to the title's initials on a rich subject-tuned gradient with subtle pattern,
 * never a broken-image icon.
 * Decorative either way: the title is always rendered next to it.
 */
export function CourseCover({ title, imageUrl, size = "card", className }: CourseCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;
  const palette = pickPalette(title);

  return (
    <div
      className={[styles.cover, styles[size], styles[palette], className].filter(Boolean).join(" ")}
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
        <>
          <div className={styles.pattern} aria-hidden="true" />
          <div className={styles.glow} aria-hidden="true" />
          <span className={styles.initialsBadge} aria-hidden="true">
            <span className={styles.initials}>{initials(title)}</span>
          </span>
        </>
      )}
    </div>
  );
}
