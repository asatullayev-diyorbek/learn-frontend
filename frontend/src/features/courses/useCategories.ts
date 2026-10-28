/* Category list for the filter chips: fetched once per catalog visit. */
import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "../../services/api/client";
import { getCategories } from "../../services/api/courses";
import type { Category } from "../../types/api";

export type CategoriesState =
  | { status: "loading" }
  | { status: "ready"; categories: Category[] }
  | { status: "error" };

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(
      (categories) => setState({ status: "ready", categories }),
      (error: unknown) => {
        if (!isAbortError(error)) setState({ status: "error" });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
