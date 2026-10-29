/*
 * Profile page (/profile) e2e against the built app, API mocked at the
 * network layer: mockApi.ts for /me + logout, mockCoursesApi.ts for
 * GET /api/courses/mine/ (and the catalog the empty state links to).
 */
import { expect, test, type Page } from "@playwright/test";
import { E2E_USER, mockAuthApi, type MockOptions, type MockUser } from "./mockApi";
import { makeCourses, mockCoursesApi, type CoursesMockOptions, type MockCourse } from "./mockCoursesApi";

const header = (page: Page) => page.getByRole("banner");
const greeting = (page: Page) => page.getByTestId("header-greeting");
const signOutButton = (page: Page) => header(page).getByRole("button", { name: "Chiqish" });
const cards = (page: Page) => page.getByTestId("my-courses").getByTestId("course-card");
const nameHeading = (page: Page, name: string) => page.getByRole("heading", { level: 1, name });
const myCoursesHeading = (page: Page) => page.getByRole("heading", { level: 2, name: "Mening kurslarim" });
const announcer = (page: Page) => page.getByTestId("my-courses").getByTestId("live-region");

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth === el.clientWidth;
  });

const gridColumns = (page: Page) =>
  page
    .getByTestId("my-courses-grid")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);

/** The catalog, with the user enrolled in three courses (enrolled_at decides the order). */
function enrolledCourses(): MockCourse[] {
  const courses = makeCourses();
  const enroll = (slug: string, at: string) => {
    const c = courses.find((x) => x.slug === slug)!;
    c.is_enrolled = true;
    c.enrolled_at = at;
  };
  enroll("python-asoslari", "2026-10-01T09:00:00Z");
  enroll("typescript-amaliyot", "2026-10-20T12:00:00Z");
  enroll("pandas-tahlil", "2026-10-10T08:30:00Z");
  return courses;
}

async function member(
  page: Page,
  {
    user = E2E_USER,
    auth = {},
    courses = {},
  }: { user?: MockUser; auth?: MockOptions; courses?: CoursesMockOptions } = {},
) {
  const authCalls = await mockAuthApi(page, { user, ...auth });
  const mocked = await mockCoursesApi(page, { courses: enrolledCourses(), ...courses, signedIn: true });
  return { auth: authCalls, ...mocked };
}

/* ------------------------------------------------------------------------ */

test.describe("guard", () => {
  test("a guest is sent to /login?next=/profile, without ever asking for /mine/", async ({ page }) => {
    await mockAuthApi(page);
    const { calls } = await mockCoursesApi(page, { signedIn: false });
    await page.goto("/profile");

    await expect(page).toHaveURL("/login?next=%2Fprofile");
    await expect(page.getByRole("heading", { level: 1, name: "Tizimga kirish" })).toBeVisible();
    expect(calls.mine).toBe(0);
  });

  test("…and signing in from there lands back on the profile", async ({ page }) => {
    await mockAuthApi(page); // guest until the code is verified
    await mockCoursesApi(page, { courses: enrolledCourses(), signedIn: true });
    await page.goto("/profile");
    await expect(page).toHaveURL("/login?next=%2Fprofile");

    await page.getByRole("tab", { name: "Kod orqali" }).click();
    await page.getByLabel("Tasdiqlash kodi").fill("12345");
    await page.getByRole("button", { name: "Tasdiqlash va kirish" }).click();

    await expect(page).toHaveURL("/profile", { timeout: 5000 });
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
  });

  test("while /me is in flight: a skeleton — no content flash, no premature redirect", async ({ page }) => {
    const { calls } = await member(page, { auth: { meDelayMs: 1200 } });
    await page.goto("/profile");

    const loading = page.getByTestId("profile-loading");
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
    await expect(page).toHaveURL("/profile");
    expect(calls.mine).toBe(0);

    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(loading).toHaveCount(0);
    await expect(page).toHaveURL("/profile");
  });

  test("a network error on /me shows an error with retry — not a bounce to /login", async ({ page }) => {
    const { auth } = await member(page, { auth: { meFailure: (call) => (call === 0 ? "network" : null) } });
    await page.goto("/profile");

    const error = page.getByTestId("profile-error");
    await expect(error.getByRole("heading", { level: 1, name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    await expect(page).toHaveURL("/profile");

    await error.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(page).toHaveURL("/profile");
    expect(auth.me).toBe(2);
  });

  test("a 5xx on /me is a server error, also not treated as a guest", async ({ page }) => {
    await member(page, { auth: { meFailure: () => 500 } });
    await page.goto("/profile");
    await expect(page.getByRole("heading", { level: 1, name: "Nimadir noto‘g‘ri ketdi" })).toBeVisible();
    await expect(page).toHaveURL("/profile");
  });

  test("a session that ended after /me (401 on /mine/) goes to sign-in, back to /profile", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER });
    await mockCoursesApi(page, { signedIn: false });
    await page.goto("/profile");
    await expect(page).toHaveURL("/login?next=%2Fprofile");
  });

  test("signing out on the profile goes home, not to a sign-in prompt for the page just left", async ({
    page,
  }) => {
    await member(page);
    await page.goto("/profile");
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();

    await signOutButton(page).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(page.getByTestId("live-region").first()).toHaveText("Tizimdan chiqdingiz.");
  });
});

/* ------------------------------------------------------------------------ */

test.describe("who am I", () => {
  test("name, Telegram username and initials; no invented join date", async ({ page }) => {
    await member(page);
    await page.goto("/profile");

    await expect(page).toHaveTitle("Profil — Learn");
    const intro = page.getByTestId("profile-header");
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(page.getByTestId("profile-telegram")).toHaveText("@diyor");
    await expect(intro).toContainText("DA");
    // /me has no join date, so nothing claims one.
    await expect(intro).not.toContainText(/qo‘shilgan|a’zo/i);
  });

  test("without a first name the @username is the name, shown once", async ({ page }) => {
    await member(page, { user: { ...E2E_USER, first_name: "", last_name: "" } });
    await page.goto("/profile");
    await expect(nameHeading(page, "@diyor")).toBeVisible();
    await expect(page.getByTestId("profile-telegram")).toHaveCount(0);
    await expect(page.getByTestId("profile-header")).toContainText("D");
  });

  test("without a Telegram username there is no handle line", async ({ page }) => {
    await member(page, { user: { ...E2E_USER, telegram_username: "" } });
    await page.goto("/profile");
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(page.getByTestId("profile-telegram")).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("my courses", () => {
  test("lists enrolled courses newest first with the catalog's cards", async ({ page }) => {
    const { calls } = await member(page);
    await page.goto("/profile");

    await expect(myCoursesHeading(page)).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(page.getByTestId("my-courses-count")).toHaveText("3 ta kurs");
    await expect(announcer(page)).toHaveText("3 ta kurs");

    // Most recently enrolled first, exactly as the API orders them.
    const slugs = await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-slug")));
    expect(slugs).toEqual(["typescript-amaliyot", "pandas-tahlil", "python-asoslari"]);

    // Same card as the catalog, one heading level down under "Mening kurslarim".
    const python = cards(page).filter({ hasText: "Python asoslari" });
    await expect(python.getByRole("heading", { level: 3, name: "Python asoslari" })).toBeVisible();
    await expect(python).toContainText("Backend");
    await expect(python.getByTestId("course-level")).toHaveText("Boshlang‘ich");
    await expect(python.getByTestId("course-instructor")).toHaveText("Diyorbek Asatullayev");
    await expect(python.getByTestId("course-enrolled-count")).toHaveText("12 ta o‘quvchi");
    await expect(python.getByTestId("course-cover").locator("img")).toBeVisible();
    await expect(python.getByTestId("course-enrolled-badge")).toBeVisible();
    expect(calls.mine).toBe(1);

    await python.getByRole("link", { name: "Python asoslari" }).click();
    await expect(page).toHaveURL("/courses/python-asoslari");
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
  });

  test("shows the catalog's skeleton grid while /mine/ loads", async ({ page }) => {
    await member(page, { courses: { mineDelayMs: 1000 } });
    await page.goto("/profile");
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    const loading = page.getByTestId("my-courses").getByTestId("courses-loading");
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(cards(page)).toHaveCount(3);
    await expect(loading).toHaveCount(0);
  });

  test("no enrolments: an invitation into the catalog, with a working link", async ({ page }) => {
    await member(page, { courses: { courses: makeCourses() } });
    await page.goto("/profile");

    const empty = page.getByTestId("my-courses-empty");
    await expect(empty.getByRole("heading", { level: 3, name: "Hali hech qaysi kursga yozilmagansiz" })).toBeVisible();
    // Same wording as the member home's invitation for the same situation.
    await expect(empty).toContainText("Kurslar katalogini ko‘rib chiqing");
    await expect(announcer(page)).toHaveText("Hali hech qaysi kursga yozilmagansiz");
    await expect(cards(page)).toHaveCount(0);
    await expect(page.getByTestId("my-courses-error")).toHaveCount(0);

    const browse = empty.getByRole("link", { name: "Kurslarni ko‘rish" });
    await expect(browse).toHaveAttribute("href", "/courses");
    await browse.click();
    await expect(page).toHaveURL("/courses");
    await expect(page.getByRole("heading", { level: 1, name: "Kurslar" })).toBeVisible();
  });

  test("enrolling in the catalog shows up on the profile", async ({ page }) => {
    await member(page, { courses: { courses: makeCourses() } });
    await page.goto("/courses/django-rest");
    await page.getByRole("button", { name: "Kursga yozilish" }).click();
    await expect(page.getByTestId("enrolled-status")).toBeVisible();

    await greeting(page).click();
    await expect(page).toHaveURL("/profile");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toHaveAttribute("data-slug", "django-rest");
  });

  test("a network error on /mine/ keeps the profile and offers a working retry", async ({ page }) => {
    const { calls } = await member(page, { courses: { mineFailure: (call) => (call === 0 ? "network" : null) } });
    await page.goto("/profile");

    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    const error = page.getByTestId("my-courses-error");
    await expect(error.getByRole("heading", { level: 3, name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    await expect(announcer(page)).toHaveText("Serverga ulanib bo‘lmadi");
    await expect(page.getByTestId("my-courses-empty")).toHaveCount(0);

    await error.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(cards(page)).toHaveCount(3);
    await expect(error).toHaveCount(0);
    expect(calls.mine).toBe(2);
  });

  test("a 5xx on /mine/ is a server error, distinct from the empty state", async ({ page }) => {
    await member(page, { courses: { mineFailure: () => 500 } });
    await page.goto("/profile");
    await expect(page.getByRole("heading", { level: 3, name: "Nimadir noto‘g‘ri ketdi" })).toBeVisible();
    await expect(page.getByTestId("my-courses-empty")).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("header link", () => {
  test("the signed-in greeting links to /profile and marks it current there", async ({ page }) => {
    await member(page);
    await page.goto("/");

    const link = header(page).getByRole("link", { name: /Diyorbek/ });
    await expect(link).toHaveAttribute("href", "/profile");
    await expect(link).toHaveAccessibleName("Salom, Diyorbek (profil)");
    await expect(link).not.toHaveAttribute("aria-current", /.*/);

    await link.click();
    await expect(page).toHaveURL("/profile");
    await expect(nameHeading(page, "Diyorbek")).toBeVisible();
    await expect(link).toHaveAttribute("aria-current", "page");
  });

  test("guests get no profile link, just Kirish", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/");
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(header(page).locator('a[href="/profile"]')).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("keyboard", () => {
  test("header → greeting → cards in order, each with a visible focus ring", async ({ page }) => {
    await member(page);
    await page.goto("/");
    await expect(page.getByTestId("home-member")).toBeVisible();

    // Brand, Kurslar, then the greeting link; Enter opens the profile.
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await expect(greeting(page)).toBeFocused();
    expect(await greeting(page).evaluate((el) => getComputedStyle(el).boxShadow)).toContain("0px 0px 0px 3px");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/profile");
    await expect(cards(page)).toHaveCount(3);

    // Greeting is still focused after the in-app navigation; Chiqish, then the first card.
    await expect(greeting(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(signOutButton(page)).toBeFocused();
    await page.keyboard.press("Tab");
    const first = cards(page).first();
    await expect(first.getByRole("link")).toBeFocused();
    await expect.poll(() => first.evaluate((el) => getComputedStyle(el).boxShadow)).toContain("0px 0px 0px 3px");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/courses/typescript-amaliyot");
  });

  test("the empty state's catalog link and the error retry are keyboard-operable", async ({ page }) => {
    await member(page, { courses: { courses: makeCourses() } });
    await page.goto("/profile");
    const browse = page.getByTestId("my-courses-empty").getByRole("link", { name: "Kurslarni ko‘rish" });
    await browse.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/courses");

    await page.unrouteAll({ behavior: "ignoreErrors" });
    await member(page, { courses: { mineFailure: (call) => (call === 0 ? 500 : null) } });
    await page.goto("/profile");
    const retry = page.getByTestId("my-courses-error").getByRole("button", { name: "Qayta urinish" });
    await retry.focus();
    await page.keyboard.press("Enter");
    await expect(cards(page)).toHaveCount(3);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("responsive layout", () => {
  const LONG_NAME = "Muhammadabdulaziz-Abdurahmonov-Toshkentiy";
  const LONG_TITLE = "Juda-juda-uzun-sarlavhali-kurs-nomi-bo‘lsa-ham-sahifa-sig‘ishi-kerak";
  const longCourses = () => {
    const courses = enrolledCourses();
    courses[0]!.title = LONG_TITLE;
    return courses;
  };
  const longUser = { ...E2E_USER, first_name: LONG_NAME, telegram_username: "juda_uzun_telegram_username_123" };

  const viewports = [
    { width: 1280, height: 800, columns: 3 },
    { width: 375, height: 740, columns: 1 },
  ];

  for (const vp of viewports) {
    test(`profile fits ${vp.width}px (${vp.columns}-column grid), populated, empty and loading`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await member(page, { user: longUser, courses: { courses: longCourses() } });
      await page.goto("/profile");

      await expect(cards(page)).toHaveCount(3);
      expect(await gridColumns(page)).toBe(vp.columns);
      expect(await noHorizontalScroll(page)).toBe(true);
      const name = await nameHeading(page, LONG_NAME).boundingBox();
      expect(name!.x + name!.width).toBeLessThanOrEqual(vp.width);
      const signOut = await signOutButton(page).boundingBox();
      expect(signOut!.x + signOut!.width).toBeLessThanOrEqual(vp.width);
      // The greeting link truncates rather than pushing the header wider.
      const link = await greeting(page).boundingBox();
      expect(link!.x + link!.width).toBeLessThanOrEqual(signOut!.x);
      expect(link!.height).toBeGreaterThanOrEqual(44);

      await page.unrouteAll({ behavior: "ignoreErrors" });
      await member(page, { user: longUser, courses: { courses: makeCourses() } });
      await page.reload();
      await expect(page.getByTestId("my-courses-empty")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);

      await page.unrouteAll({ behavior: "ignoreErrors" });
      await member(page, { user: longUser, auth: { meDelayMs: 800 } });
      await page.reload();
      await expect(page.getByTestId("profile-loading")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }
});
