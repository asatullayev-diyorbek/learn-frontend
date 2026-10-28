import { useSyncExternalStore } from "react";

/*
 * A shared once-per-second clock. Every component using useCountdown reads
 * the same ticker, so N countdowns cost one interval, and React re-renders
 * only when the second actually changes.
 */
const listeners = new Set<() => void>();
let intervalId: number | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (intervalId === undefined) {
    intervalId = window.setInterval(() => listeners.forEach((l) => l()), 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };
}

function getNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Whole seconds left until `deadlineMs` (epoch milliseconds), clamped at 0.
 * Pass null to disable.
 */
export function useCountdown(deadlineMs: number | null): number {
  const nowSeconds = useSyncExternalStore(subscribe, getNowSeconds, getNowSeconds);
  if (deadlineMs === null) return 0;
  // floor/floor keeps a fresh 600s deadline at exactly "10:00", never "10:01".
  return Math.max(0, Math.floor(deadlineMs / 1000) - nowSeconds);
}

/** 600 → "10:00", 61 → "1:01" */
export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
