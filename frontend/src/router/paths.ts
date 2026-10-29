export const ROUTES = {
  home: "/",
  login: "/login",
  courses: "/courses",
  /** Route pattern for the router; build links with ROUTES.courseDetail(slug). */
  courseDetailPattern: "/courses/:slug",
  courseDetail: (slug: string) => `/courses/${encodeURIComponent(slug)}`,
  profile: "/profile",
} as const;

/** A link to /login that returns the visitor to `path` after signing in. */
export function loginWithNext(path: string): string {
  return `${ROUTES.login}?next=${encodeURIComponent(path)}`;
}

/**
 * Reads `next` from a location.search string and returns it only if it's a
 * safe same-site path (starts with exactly one "/", never "//" or a
 * scheme) — otherwise null. Guards against building an open redirect out
 * of a query param.
 */
export function getSafeNextPath(search: string): string | null {
  const next = new URLSearchParams(search).get("next");
  if (!next) return null;
  if (next === "/") return next;
  // Reject "//host/...", "/\host/..." (browsers treat a leading backslash
  // like a slash) and any embedded scheme — all are ways to smuggle a
  // cross-origin redirect through what looks like a path.
  if (!/^\/[^/\\]/.test(next) || next.includes("://") || next.includes("\\")) return null;
  return next;
}
