export const ROUTES = {
  home: "/",
  login: "/login",
  courses: "/courses",
  /** Route pattern for the router; build links with ROUTES.courseDetail(slug). */
  courseDetailPattern: "/courses/:slug",
  courseDetail: (slug: string) => `/courses/${encodeURIComponent(slug)}`,
} as const;
