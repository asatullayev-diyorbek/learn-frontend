/*
 * Route-interception mocks for the courses contract (apps/courses), same
 * approach as mockApi.ts. Filtering, pagination, 404s and idempotent
 * enroll/unenroll are reproduced so specs exercise real request flows.
 */
import type { Page, Request } from "@playwright/test";

export type Level = "beginner" | "intermediate" | "advanced";

export interface MockCategory {
  id: number;
  name: string;
  slug: string;
}

export interface MockCourse {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: Level;
  category: MockCategory;
  instructor: { id: number; full_name: string; title?: string; bio?: string };
  cover_image_url: string;
  enrolled_count: number;
  is_enrolled: boolean;
}

export const CATEGORIES: MockCategory[] = [
  { id: 1, name: "Backend", slug: "backend" },
  { id: 2, name: "Frontend", slug: "frontend" },
  { id: 3, name: "Ma’lumotlar", slug: "data" },
];
const [BACKEND, FRONTEND, DATA] = CATEGORIES as [MockCategory, MockCategory, MockCategory];

const DIYORBEK = { id: 1, full_name: "Diyorbek Asatullayev" };
const MALIKA = { id: 2, full_name: "Malika Karimova" };

/** A 1×1 PNG, served for COVER_OK. */
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
export const COVER_OK = "/mock-covers/ok.png";
export const COVER_BROKEN = "/mock-covers/missing.png";

function course(
  id: number,
  slug: string,
  title: string,
  level: Level,
  category: MockCategory,
  extra: Partial<MockCourse> = {},
): MockCourse {
  return {
    id,
    slug,
    title,
    summary: `${title} kursining qisqacha tavsifi.`,
    description: `${title} — to‘liq tavsif.\n\nIkkinchi xatboshi: kurs kimlar uchun va nimalar o‘rgatiladi.`,
    level,
    category,
    instructor: DIYORBEK,
    cover_image_url: "",
    enrolled_count: 10 + id,
    is_enrolled: false,
    ...extra,
  };
}

/** 8 courses → with PAGE_SIZE 6, the unfiltered catalog is two pages. */
export function makeCourses(): MockCourse[] {
  return [
    course(1, "python-asoslari", "Python asoslari", "beginner", BACKEND, {
      summary: "Dasturlashni noldan Python tilida boshlang.",
      description:
        "Bu kurs dasturlashni hech qachon o‘rganmaganlar uchun.\n\nO‘zgaruvchilar, shartlar, sikllar va funksiyalarni amaliy misollarda o‘rganasiz.\nHar bir mavzudan so‘ng topshiriq bor.",
      cover_image_url: COVER_OK,
      enrolled_count: 12,
    }),
    course(2, "django-rest", "Django REST API", "intermediate", BACKEND),
    course(3, "postgresql-chuqur", "PostgreSQL chuqur", "advanced", BACKEND, { instructor: MALIKA }),
    course(4, "react-boshlang-ich", "React boshlang‘ich", "beginner", FRONTEND, {
      cover_image_url: COVER_BROKEN,
    }),
    course(5, "typescript-amaliyot", "TypeScript amaliyotda", "intermediate", FRONTEND, {
      instructor: { ...MALIKA, title: "Senior frontend muhandis", bio: "10 yildan ortiq tajriba." },
    }),
    course(6, "css-layout", "Zamonaviy CSS layout", "beginner", FRONTEND),
    course(7, "pandas-tahlil", "Pandas bilan tahlil", "intermediate", DATA),
    course(8, "ml-kirish", "Machine learningga kirish", "advanced", DATA),
  ];
}

export const PAGE_SIZE = 6;

type Failure = "network" | number | null;

export interface CoursesMockOptions {
  courses?: MockCourse[];
  /** Whether enroll/unenroll calls carry a session (pair with mockAuthApi's `user`). */
  signedIn?: boolean;
  categoriesFailure?: (call: number) => Failure;
  listFailure?: (call: number, params: URLSearchParams) => Failure;
  /** Delay for list responses; return 0 for none. */
  listDelayMs?: (call: number, params: URLSearchParams) => number;
  detailFailure?: (call: number, slug: string) => Failure;
  detailDelayMs?: number;
  enrollFailure?: (call: number, method: "POST" | "DELETE") => Failure;
  enrollDelayMs?: number;
}

export interface CoursesCalls {
  categories: number;
  /** Query string of every GET /courses/ request, e.g. "category=backend&page=2". */
  list: string[];
  detail: string[];
  enroll: { method: "POST" | "DELETE"; slug: string; csrfHeader: string | null }[];
}

const json = (status: number, body: unknown) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});


export async function mockCoursesApi(page: Page, options: CoursesMockOptions = {}) {
  const courses = options.courses ?? makeCourses();
  const calls: CoursesCalls = { categories: 0, list: [], detail: [], enroll: [] };
  const signedIn = () => options.signedIn ?? false;
  // Contract: is_enrolled is always false for a guest.
  const asDetail = (c: MockCourse) => ({ ...c, is_enrolled: signedIn() && c.is_enrolled });
  const asListItem = (c: MockCourse) => {
    const item: Partial<MockCourse> = asDetail(c);
    delete item.description;
    return item;
  };

  await page.route(
    (url) => url.pathname.startsWith("/mock-covers/"),
    (route) =>
      route.request().url().endsWith(COVER_OK)
        ? route.fulfill({ status: 200, contentType: "image/png", body: PNG_1PX })
        : route.fulfill({ status: 404, body: "" }),
  );

  await page.route(
    (url) => url.pathname.startsWith("/api/courses/"),
    async (route, request: Request) => {
      const url = new URL(request.url());
      const parts = url.pathname.replace(/^\/api\/courses\//, "").split("/").filter(Boolean);
      const method = request.method();

      const fail = (failure: Failure) => {
        if (failure === "network") return route.abort("internetdisconnected");
        return route.fulfill(json(failure as number, { detail: "error" }));
      };

      // GET /api/courses/categories/
      if (parts.length === 1 && parts[0] === "categories") {
        const call = calls.categories++;
        const failure = options.categoriesFailure?.(call) ?? null;
        if (failure !== null) return fail(failure);
        return route.fulfill(
          json(
            200,
            CATEGORIES.map((c) => ({
              ...c,
              course_count: courses.filter((x) => x.category.slug === c.slug).length,
            })),
          ),
        );
      }

      // GET /api/courses/?category=&level=&search=&page=
      if (parts.length === 0 && method === "GET") {
        const params = url.searchParams;
        const call = calls.list.length;
        calls.list.push(params.toString());
        const delay = options.listDelayMs?.(call, params) ?? 0;
        if (delay) await new Promise((r) => setTimeout(r, delay));
        const failure = options.listFailure?.(call, params) ?? null;
        if (failure !== null) return fail(failure);

        const category = params.get("category");
        const level = params.get("level");
        const search = params.get("search")?.toLowerCase();
        const pageNumber = Number(params.get("page") ?? "1");
        const matching = courses.filter(
          (c) =>
            (!category || c.category.slug === category) &&
            (!level || c.level === level) &&
            (!search ||
              c.title.toLowerCase().includes(search) ||
              c.summary.toLowerCase().includes(search)),
        );
        const start = (pageNumber - 1) * PAGE_SIZE;
        if (start > 0 && start >= matching.length) {
          return route.fulfill(json(404, { detail: "Invalid page." }));
        }
        const pageUrl = (n: number) => {
          // Absolute, on the backend's host — like DRF builds them.
          const next = new URLSearchParams(params);
          if (n === 1) next.delete("page");
          else next.set("page", String(n));
          const qs = next.toString();
          return `http://localhost:8000/api/courses/${qs ? `?${qs}` : ""}`;
        };
        const end = start + PAGE_SIZE;
        return route.fulfill(
          json(200, {
            count: matching.length,
            next: end < matching.length ? pageUrl(pageNumber + 1) : null,
            previous: pageNumber > 1 ? pageUrl(pageNumber - 1) : null,
            results: matching.slice(start, end).map(asListItem),
          }),
        );
      }

      const slug = decodeURIComponent(parts[0] ?? "");
      const found = courses.find((c) => c.slug === slug);

      // GET /api/courses/<slug>/
      if (parts.length === 1 && method === "GET") {
        const call = calls.detail.length;
        calls.detail.push(slug);
        if (options.detailDelayMs) await new Promise((r) => setTimeout(r, options.detailDelayMs));
        const failure = options.detailFailure?.(call, slug) ?? null;
        if (failure !== null) return fail(failure);
        if (!found) return route.fulfill(json(404, { detail: "not_found" }));
        return route.fulfill(json(200, asDetail(found)));
      }

      // POST | DELETE /api/courses/<slug>/enroll/
      if (parts.length === 2 && parts[1] === "enroll" && (method === "POST" || method === "DELETE")) {
        const headers = await request.allHeaders();
        const call = calls.enroll.length;
        calls.enroll.push({ method, slug, csrfHeader: headers["x-csrftoken"] ?? null });
        if (options.enrollDelayMs) await new Promise((r) => setTimeout(r, options.enrollDelayMs));
        const failure = options.enrollFailure?.(call, method) ?? null;
        if (failure !== null) return fail(failure);
        if (!signedIn()) return route.fulfill(json(401, { detail: "not_authenticated" }));
        if (!found) return route.fulfill(json(404, { detail: "not_found" }));

        const enroll = method === "POST";
        if (found.is_enrolled !== enroll) {
          found.is_enrolled = enroll;
          found.enrolled_count += enroll ? 1 : -1;
        }
        return route.fulfill(
          json(200, {
            status: enroll ? "enrolled" : "not_enrolled",
            enrolled_count: found.enrolled_count,
          }),
        );
      }

      return route.fulfill(json(404, { detail: "not_found" }));
    },
  );

  return { calls, courses };
}
