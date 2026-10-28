export interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
}

/**
 * Visually hidden aria-live region. Render it once, unconditionally, and
 * change `message` — screen readers announce every content change.
 */
export function LiveRegion({ message, politeness = "polite" }: LiveRegionProps) {
  return (
    <div
      className="sr-only"
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      data-testid="live-region"
    >
      {message}
    </div>
  );
}
