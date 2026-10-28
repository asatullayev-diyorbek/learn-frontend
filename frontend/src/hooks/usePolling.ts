import { useEffect, useLayoutEffect, useRef } from "react";

interface PollingOptions {
  intervalMs: number;
  enabled: boolean;
}

/**
 * Runs `task` every `intervalMs` while `enabled` is true.
 *
 * Uses a setTimeout chain rather than setInterval, so a slow request never
 * overlaps the next one. The AbortSignal passed to `task` fires when polling
 * stops or the component unmounts, cancelling any in-flight request.
 * `task` is responsible for its own error handling.
 */
export function usePolling(task: (signal: AbortSignal) => Promise<void>, options: PollingOptions) {
  const { intervalMs, enabled } = options;
  const taskRef = useRef(task);

  useLayoutEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let timer: number | undefined;

    const tick = async () => {
      try {
        await taskRef.current(controller.signal);
      } catch {
        /* the task owns error handling; keep the loop alive */
      }
      if (!controller.signal.aborted) {
        timer = window.setTimeout(tick, intervalMs);
      }
    };

    timer = window.setTimeout(tick, intervalMs);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [enabled, intervalMs]);
}
