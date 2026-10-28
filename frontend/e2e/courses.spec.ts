/*
 * Course catalog (/courses) and course page (/courses/:slug) e2e against the
 * built app, API mocked at the network layer (mockCoursesApi.ts mirrors the
 * apps/courses contract; mockApi.ts provides /me, CSRF and logout).
 */
import { expect, test, type Page } from "@playwright/test";
import { CSRF_TOKEN, E2E_USER, mockAuthApi } from "./mockApi";
import { makeCourses, mockCoursesApi, type MockCourse } from "./mockCoursesApi";

const cards = (page: Page) => page.getByTestId("course-card");
const card = (page: Page, title: string) => cards(page).filter({ hasText: title });
const searchBox = (page: Page) => page.getByRole("searchbox", { name: "Kurslarni qidirish" });
const categoryRadio = (page: Page, name: string) =>
  page.getByTestId("category-filter").getByRole("radio", { name, exact: true });
const levelRadio = (page: Page, name: string) =>
  page.getByTestId("level-filter").getByRole("radio", { name, exact: true });
const loadMore = (page: Page) => page.getByRole("button", { name: "Yana yuklash" });
const listAnnouncer = (page: Page) => page.getByTestId("courses-page").getByTestId("live-region");
const enrollAnnouncer = (page: Page) => page.getByTestId("enroll-panel").getByTestId("live-region");
const enrollButton = (page: Page) => page.getByRole("button", { name: "Kursga yozilish" });
const unenrollButton = (page: Page) => page.getByRole("button", { name: "Kursdan chiqish" });
const detailCount = (page: Page) =>
  page.getByTestId("course-detail").locator("header").getByTestId("course-enrolled-count");

const markNoReload = (page: Page) =>
  page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
const stillNoReload = (page: Page) =>
  page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true);

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth === el.clientWidth;
  });

const gridColumns = (page: Page) =>
  page
    .getByTestId("courses-grid")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);

const boxShadow = (locator: ReturnType<Page["locator"]>) =>
  locator.evaluate((el) => getComputedStyle(el).boxShadow);

async function guest(page: Page, options: Parameters<typeof mockCoursesApi>[1] = {}) {
  await mockAuthApi(page);
  return mockCoursesApi(page, { ...options, signedIn: false });
}

async function member(page: Page, options: Parameters<typeof mockCoursesApi>[1] = {}) {
  const auth = await mockAuthApi(page, { user: E2E_USER });
  const courses = await mockCoursesApi(page, { ...options, signedIn: true });
  return { auth, ...courses };
}

/* ------------------------------------------------------------------------ */

test.describe("catalog list", () => {
  test("renders cards with every field, then 'Yana yuklash' appends the next page", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses");

    await expect(page).toHaveTitle("Kurslar — Learn");
    await expect(page.getByRole("heading", { level: 1, name: "Kurslar" })).toBeVisible();
    await expect(cards(page)).toHaveCount(6);
    await expect(page.getByTestId("courses-count")).toHaveText("8 ta kurs");
    await expect(listAnnouncer(page)).toHaveText("8 ta kurs topildi");

    const python = card(page, "Python asoslari");
    await expect(python.getByRole("heading", { level: 2, name: "Python asoslari" })).toBeVisible();
    await expect(python).toContainText("Dasturlashni noldan Python tilida boshlang.");
    await expect(python).toContainText("Backend");
    await expect(python.getByTestId("course-level")).toHaveText("Boshlang‘ich");
    await expect(python.getByTestId("course-instructor")).toHaveText("Diyorbek Asatullayev");
    await expect(python.getByTestId("course-enrolled-count")).toHaveText("12 ta o‘quvchi");
    await expect(python.getByRole("link", { name: "Python asoslari" })).toHaveAttribute(
      "href",
      "/courses/python-asoslari",
    );
    // Guests never see an "enrolled" badge.
    await expect(page.getByTestId("course-enrolled-badge")).toHaveCount(0);

    await loadMore(page).click();
    await expect(cards(page)).toHaveCount(8);
    // Last page: the button is gone; focus continues at the first new card.
    await expect(loadMore(page)).toHaveCount(0);
    await expect(cards(page).nth(6).getByRole("link")).toBeFocused();
    await expect(listAnnouncer(page)).toHaveText("Yana 2 ta kurs yuklandi");
    expect(calls.list).toEqual(["", "page=2"]);
    expect(calls.categories).toBe(1);
  });

  test("covers: image when present, a clean initials placeholder when empty or broken", async ({ page }) => {
    await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);

    const withImage = card(page, "Python asoslari").getByTestId("course-cover");
    await expect(withImage.locator("img")).toBeVisible();
    await expect(withImage).not.toHaveAttribute("data-placeholder", /.*/);

    const empty = card(page, "Django REST API").getByTestId("course-cover");
    await expect(empty).toHaveAttribute("data-placeholder", "true");
    await expect(empty).toHaveText("DR");
    await expect(empty.locator("img")).toHaveCount(0);

    // A URL that 404s falls back to the placeholder instead of a broken image.
    const broken = card(page, "React boshlang‘ich").getByTestId("course-cover");
    await expect(broken).toHaveAttribute("data-placeholder", "true");
    await expect(broken).toHaveText("RB");
  });

  test("shows a skeleton grid while the first page loads", async ({ page }) => {
    await guest(page, { listDelayMs: (call) => (call === 0 ? 1000 : 0) });
    await page.goto("/courses");
    const loading = page.getByTestId("courses-loading");
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(cards(page)).toHaveCount(6);
    await expect(loading).toHaveCount(0);
  });

  test("a network failure shows the error state, and retry recovers", async ({ page }) => {
    const { calls } = await guest(page, { listFailure: (call) => (call === 0 ? "network" : null) });
    await page.goto("/courses");

    const error = page.getByTestId("courses-error");
    await expect(error.getByRole("heading", { name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    await expect(listAnnouncer(page)).toHaveText("Serverga ulanib bo‘lmadi");
    await error.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(cards(page)).toHaveCount(6);
    expect(calls.list).toHaveLength(2);
  });

  test("a 5xx is a server error, distinct from the empty state", async ({ page }) => {
    await guest(page, { listFailure: () => 500 });
    await page.goto("/courses");
    await expect(page.getByRole("heading", { name: "Nimadir noto‘g‘ri ketdi" })).toBeVisible();
    await expect(page.getByTestId("courses-empty-results")).toHaveCount(0);
  });

  test("a failed 'load more' keeps the loaded cards and can be retried", async ({ page }) => {
    await guest(page, {
      listFailure: (call, params) => (call === 1 && params.get("page") === "2" ? 500 : null),
    });
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);

    await loadMore(page).click();
    const results = page.getByTestId("courses-results");
    await expect(results.getByText("Keyingi kurslarni yuklab bo‘lmadi. Qayta urinib ko‘ring.")).toBeVisible();
    await expect(listAnnouncer(page)).toHaveText("Keyingi kurslarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
    await expect(cards(page)).toHaveCount(6);
    await expect(loadMore(page)).toBeEnabled();
    await expect(loadMore(page)).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(cards(page)).toHaveCount(8);
    await expect(results.getByText("Keyingi kurslarni yuklab bo‘lmadi.", { exact: false })).toHaveCount(0);
  });

  test("categories that fail to load show an inline retry, not a broken page", async ({ page }) => {
    await guest(page, { categoriesFailure: (call) => (call === 0 ? 500 : null) });
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);
    const failed = page.getByTestId("category-filter-error");
    await expect(failed).toContainText("Yo‘nalishlarni yuklab bo‘lmadi.");
    await failed.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(categoryRadio(page, "Backend")).toBeVisible();
  });

  test("an empty catalog (no filters) says so, without a pointless 'clear filters'", async ({ page }) => {
    await guest(page, { courses: [] });
    await page.goto("/courses");
    const empty = page.getByTestId("courses-empty-results");
    await expect(empty.getByRole("heading", { name: "Hozircha kurslar yo‘q" })).toBeVisible();
    await expect(empty.getByRole("button")).toHaveCount(0);
    await expect(loadMore(page)).toHaveCount(0);
  });

  test("signed-in users see which courses they are enrolled in", async ({ page }) => {
    const courses = makeCourses();
    courses[1]!.is_enrolled = true;
    await member(page, { courses });
    await page.goto("/courses");
    await expect(card(page, "Django REST API").getByTestId("course-enrolled-badge")).toHaveText(
      "Yozilgansiz",
    );
    await expect(page.getByTestId("course-enrolled-badge")).toHaveCount(1);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("filters", () => {
  test("category and level chips filter results and write to the URL with replace", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);
    await expect(categoryRadio(page, "Barchasi")).toBeChecked();
    await expect(levelRadio(page, "Barchasi")).toBeChecked();
    const historyLength = await page.evaluate(() => history.length);

    await categoryRadio(page, "Frontend").click();
    await expect(page).toHaveURL(/\/courses\?category=frontend$/);
    await expect(cards(page)).toHaveCount(3);
    for (const c of await cards(page).all()) await expect(c).toContainText("Frontend");
    await expect(page.getByTestId("courses-count")).toHaveText("3 ta kurs");
    await expect(listAnnouncer(page)).toHaveText("3 ta kurs topildi");

    await levelRadio(page, "Boshlang‘ich").click();
    await expect(page).toHaveURL(/\/courses\?category=frontend&level=beginner$/);
    await expect(cards(page)).toHaveCount(2);
    for (const c of await cards(page).all()) {
      await expect(c.getByTestId("course-level")).toHaveText("Boshlang‘ich");
    }

    await categoryRadio(page, "Barchasi").click();
    await expect(page).toHaveURL(/\/courses\?level=beginner$/);
    await expect(cards(page)).toHaveCount(3);

    expect(calls.list).toEqual(["", "category=frontend", "category=frontend&level=beginner", "level=beginner"]);
    // Filtering replaced the history entry every time.
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });

  test("search is debounced: one request for a typed word, reflected in the URL", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);

    await searchBox(page).pressSequentially("pandas", { delay: 40 });
    await expect(page).toHaveURL(/\/courses\?search=pandas$/);
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("Pandas bilan tahlil");
    expect(calls.list.filter((q) => q.includes("search"))).toEqual(["search=pandas"]);

    // Clearing the box clears the param.
    await searchBox(page).fill("");
    await expect(page).toHaveURL(/\/courses$/);
    await expect(cards(page)).toHaveCount(6);
  });

  test("filters are read from the URL on load (shareable links)", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses?category=backend&level=advanced&search=postgre");

    await expect(categoryRadio(page, "Backend")).toBeChecked();
    await expect(levelRadio(page, "Yuqori")).toBeChecked();
    await expect(searchBox(page)).toHaveValue("postgre");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("PostgreSQL chuqur");
    expect(calls.list[0]).toBe("category=backend&level=advanced&search=postgre");
  });

  test("an unknown level in the URL is ignored rather than sent", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses?level=expert");
    await expect(cards(page)).toHaveCount(6);
    await expect(levelRadio(page, "Barchasi")).toBeChecked();
    expect(calls.list[0]).toBe("");
  });

  test("while a filter request is in flight the previous results stay, dimmed", async ({ page }) => {
    await guest(page, { listDelayMs: (call) => (call === 0 ? 0 : 1200) });
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);

    await categoryRadio(page, "Frontend").click();
    await expect(page.getByTestId("courses-refreshing")).toBeVisible();
    await expect(page.getByTestId("courses-grid")).toHaveAttribute("aria-busy", "true");
    await expect(cards(page)).toHaveCount(6);
    await expect(page.getByTestId("courses-loading")).toHaveCount(0);
    // Nothing is announced until the new results settle.
    await expect(listAnnouncer(page)).toHaveText("");

    await expect(cards(page)).toHaveCount(3);
    await expect(page.getByTestId("courses-refreshing")).toHaveCount(0);
    await expect(page.getByTestId("courses-grid")).not.toHaveAttribute("aria-busy", /.*/);
  });

  test("no results → 'Hech narsa topilmadi', and clearing filters restores the catalog", async ({ page }) => {
    await guest(page);
    await page.goto("/courses?category=data&search=zzz");

    const empty = page.getByTestId("courses-empty-results");
    await expect(empty.getByRole("heading", { name: "Hech narsa topilmadi" })).toBeVisible();
    await expect(page.getByTestId("courses-count")).toHaveText("0 ta kurs");
    await expect(listAnnouncer(page)).toHaveText("Hech narsa topilmadi");

    await empty.getByRole("button", { name: "Filtrlarni tozalash" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(cards(page)).toHaveCount(6);
    await expect(searchBox(page)).toHaveValue("");
    await expect(categoryRadio(page, "Barchasi")).toBeChecked();
  });

  test("filtering replaces history: Back leaves the catalog", async ({ page }) => {
    await guest(page);
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Kurslar" }).click();
    await expect(cards(page)).toHaveCount(6);
    await categoryRadio(page, "Backend").click();
    await levelRadio(page, "O‘rta").click();
    await expect(page).toHaveURL(/category=backend&level=intermediate/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test("filters are fully keyboard-operable with visible focus", async ({ page }) => {
    await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);

    // Header (brand, Kurslar, Kirish) → search box.
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(searchBox(page)).toBeFocused();

    // Into the category group: lands on the checked chip; arrows select.
    await page.keyboard.press("Tab");
    await expect(categoryRadio(page, "Barchasi")).toBeFocused();
    const chip = page.getByTestId("category-filter").locator("label").first();
    await expect.poll(() => boxShadow(chip)).toContain("0px 0px 0px 3px");

    await page.keyboard.press("ArrowRight");
    await expect(categoryRadio(page, "Backend")).toBeFocused();
    await expect(categoryRadio(page, "Backend")).toBeChecked();
    await expect(page).toHaveURL(/category=backend/);
    await expect(cards(page)).toHaveCount(3);

    // Tab → level group; arrows select there too.
    await page.keyboard.press("Tab");
    await expect(levelRadio(page, "Barchasi")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(levelRadio(page, "Boshlang‘ich")).toBeChecked();
    await expect(page).toHaveURL(/category=backend&level=beginner/);
    await expect(cards(page)).toHaveCount(1);

    // Tab → first card; its whole frame shows the ring; Enter opens it.
    await page.keyboard.press("Tab");
    const link = cards(page).first().getByRole("link", { name: "Python asoslari" });
    await expect(link).toBeFocused();
    await expect.poll(() => boxShadow(cards(page).first())).toContain("0px 0px 0px 3px");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/courses\/python-asoslari$/);
  });

  test("search submits immediately on Enter", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);
    await searchBox(page).fill("css");
    await searchBox(page).press("Enter");
    await expect(page).toHaveURL(/search=css/);
    await expect(cards(page)).toHaveCount(1);
    expect(calls.list.filter((q) => q.includes("search"))).toEqual(["search=css"]);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("course page", () => {
  test("a card opens its course page in-app (title link or anywhere on the card)", async ({ page }) => {
    await guest(page);
    await page.goto("/courses");
    await markNoReload(page);

    await card(page, "Django REST API").getByRole("link").click();
    await expect(page).toHaveURL(/\/courses\/django-rest$/);
    await expect(page.getByRole("heading", { level: 1, name: "Django REST API" })).toBeVisible();
    expect(await stillNoReload(page)).toBe(true);

    await page.getByRole("link", { name: "Barcha kurslar" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    // Clicking the middle of the card (not the title) also navigates — the link is stretched.
    await card(page, "Zamonaviy CSS layout").click();
    await expect(page).toHaveURL(/\/courses\/css-layout$/);
  });

  test("shows the full course: title, description, category, level, instructor, count", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses/python-asoslari");

    const detail = page.getByTestId("course-detail");
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
    await expect(page).toHaveTitle("Python asoslari — Learn");
    await expect(detail).toContainText("Dasturlashni noldan Python tilida boshlang.");
    await expect(detail).toContainText("Backend");
    await expect(detail.locator("header").getByTestId("course-level")).toHaveText("Boshlang‘ich");
    await expect(detailCount(page)).toHaveText("12 ta o‘quvchi");
    await expect(page.getByTestId("course-instructor-card")).toContainText("Diyorbek Asatullayev");

    await expect(page.getByRole("heading", { level: 2, name: "Kurs haqida" })).toBeVisible();
    const paragraphs = page.getByTestId("course-description").locator("p");
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toHaveText("Bu kurs dasturlashni hech qachon o‘rganmaganlar uchun.");
    await expect(paragraphs.nth(1)).toContainText("Har bir mavzudan so‘ng topshiriq bor.");

    await expect(page.getByRole("link", { name: "Barcha kurslar" })).toHaveAttribute("href", "/courses");
    expect(calls.detail).toEqual(["python-asoslari"]);
  });

  test("instructor title and bio are shown when the API provides them", async ({ page }) => {
    await guest(page);
    await page.goto("/courses/typescript-amaliyot");
    const instructor = page.getByTestId("course-instructor-card");
    await expect(instructor).toContainText("Malika Karimova");
    await expect(instructor).toContainText("Senior frontend muhandis");
    await expect(instructor).toContainText("10 yildan ortiq tajriba.");
  });

  test("shows a skeleton while loading", async ({ page }) => {
    await guest(page, { detailDelayMs: 1000 });
    await page.goto("/courses/python-asoslari");
    await expect(page.getByTestId("course-detail-loading")).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
    await expect(page.getByTestId("course-detail-loading")).toHaveCount(0);
  });

  test("an unknown slug shows 'Kurs topilmadi' with a way back — not the network error", async ({ page }) => {
    await guest(page);
    await page.goto("/courses/bunday-kurs-yoq");

    const notFound = page.getByTestId("course-not-found");
    await expect(notFound.getByRole("heading", { level: 1, name: "Kurs topilmadi" })).toBeVisible();
    await expect(page).toHaveTitle("Kurs topilmadi — Learn");
    await expect(page.getByTestId("course-error")).toHaveCount(0);
    await expect(notFound.getByRole("button", { name: "Qayta urinish" })).toHaveCount(0);

    await notFound.getByRole("link", { name: "Barcha kurslar" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(cards(page)).toHaveCount(6);
  });

  test("a network error shows the error state with a working retry", async ({ page }) => {
    const { calls } = await guest(page, { detailFailure: (call) => (call === 0 ? "network" : null) });
    await page.goto("/courses/python-asoslari");

    const error = page.getByTestId("course-error");
    await expect(error.getByRole("heading", { level: 1, name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    await expect(page.getByTestId("course-not-found")).toHaveCount(0);
    await error.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
    expect(calls.detail).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------------ */

test.describe("enrolment", () => {
  test("guest: an honest sign-in CTA, and no enroll request is ever made", async ({ page }) => {
    const { calls } = await guest(page);
    await page.goto("/courses/python-asoslari");

    const panel = page.getByTestId("enroll-guest");
    const cta = panel.getByRole("link", { name: "Kirish va kursga yozilish" });
    await expect(cta).toHaveAttribute("href", "/login?next=%2Fcourses%2Fpython-asoslari");
    await expect(panel).toContainText("Kursga yozilish uchun Telegram orqali tizimga kiring.");
    await expect(enrollButton(page)).toHaveCount(0);

    await cta.click();
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(calls.enroll).toEqual([]);
  });

  test("guest: signing in from the sign-in CTA returns to the course, not home", async ({ page }) => {
    await guest(page);
    await page.goto("/courses/python-asoslari");

    await page.getByTestId("enroll-guest").getByRole("link", { name: "Kirish va kursga yozilish" }).click();
    await expect(page).toHaveURL("/login?next=%2Fcourses%2Fpython-asoslari");

    await page.getByRole("tab", { name: "Kod orqali" }).click();
    await page.getByLabel("Tasdiqlash kodi").fill("12345");
    await page.getByRole("button", { name: "Tasdiqlash va kirish" }).click();

    await expect(page).toHaveURL("/courses/python-asoslari", { timeout: 5000 });
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
  });

  test("guest: is_enrolled from a stale cache never leaks — the CTA is still sign-in", async ({ page }) => {
    const courses: MockCourse[] = makeCourses();
    courses[0]!.is_enrolled = true;
    await guest(page, { courses });
    await page.goto("/courses/python-asoslari");
    await expect(page.getByTestId("enroll-guest")).toBeVisible();
    await expect(page.getByTestId("enrolled-status")).toHaveCount(0);
  });

  test("signed in: enroll → unenroll round trip flips the button and count in place", async ({ page }) => {
    const { calls, auth } = await member(page, { enrollDelayMs: 400 });
    await page.goto("/courses/python-asoslari");
    await expect(detailCount(page)).toHaveText("12 ta o‘quvchi");
    await markNoReload(page);

    const primaryBg = await enrollButton(page).evaluate((el) => getComputedStyle(el).backgroundColor);
    await enrollButton(page).click();

    // In flight: busy, disabled, count untouched.
    const busy = page.getByRole("button", { name: "Yozilmoqda…" });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
    await expect(detailCount(page)).toHaveText("12 ta o‘quvchi");

    await expect(page.getByTestId("enrolled-status")).toContainText("Yozilgansiz");
    await expect(detailCount(page)).toHaveText("13 ta o‘quvchi");
    await expect(enrollAnnouncer(page)).toHaveText("Kursga yozildingiz.");
    await expect(unenrollButton(page)).toBeFocused();
    // Unenrolling is the quiet, secondary action — not another primary CTA.
    const secondaryBg = await unenrollButton(page).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(secondaryBg).not.toBe(primaryBg);

    await unenrollButton(page).click();
    await expect(enrollButton(page)).toBeVisible();
    await expect(page.getByTestId("enrolled-status")).toHaveCount(0);
    await expect(detailCount(page)).toHaveText("12 ta o‘quvchi");
    await expect(enrollAnnouncer(page)).toHaveText("Kursdan chiqdingiz.");
    await expect(enrollButton(page)).toBeFocused();

    expect(calls.enroll).toEqual([
      { method: "POST", slug: "python-asoslari", csrfHeader: CSRF_TOKEN },
      { method: "DELETE", slug: "python-asoslari", csrfHeader: CSRF_TOKEN },
    ]);
    expect(auth.order.indexOf("csrf")).toBeGreaterThanOrEqual(0);
    expect(await stillNoReload(page)).toBe(true);
  });

  test("signed in: the enrolled state comes from the server on load", async ({ page }) => {
    const courses = makeCourses();
    courses[0]!.is_enrolled = true;
    await member(page, { courses });
    await page.goto("/courses/python-asoslari");
    await expect(page.getByTestId("enrolled-status")).toContainText("Yozilgansiz");
    await expect(unenrollButton(page)).toBeVisible();
    await expect(enrollButton(page)).toHaveCount(0);
  });

  test("a failed enroll shows an inline error and leaves the button as it was", async ({ page }) => {
    const { calls } = await member(page, { enrollFailure: (call) => (call === 0 ? 500 : null) });
    await page.goto("/courses/python-asoslari");

    await enrollButton(page).click();
    const error = page.getByTestId("enroll-error");
    await expect(error).toContainText("Amalni bajarib bo‘lmadi.");
    await expect(enrollAnnouncer(page)).toContainText("Amalni bajarib bo‘lmadi.");
    await expect(enrollButton(page)).toBeEnabled();
    await expect(enrollButton(page)).not.toHaveAttribute("aria-busy", /.*/);
    await expect(page.getByTestId("enrolled-status")).toHaveCount(0);
    await expect(detailCount(page)).toHaveText("12 ta o‘quvchi");

    // Trying again works and clears the error.
    await enrollButton(page).click();
    await expect(page.getByTestId("enrolled-status")).toBeVisible();
    await expect(error).toHaveCount(0);
    expect(calls.enroll).toHaveLength(2);
  });

  test("a failed unenroll (offline) keeps the enrolled state", async ({ page }) => {
    const courses = makeCourses();
    courses[0]!.is_enrolled = true;
    courses[0]!.enrolled_count = 20;
    await member(page, { courses, enrollFailure: () => "network" });
    await page.goto("/courses/python-asoslari");

    await unenrollButton(page).click();
    await expect(page.getByTestId("enroll-error")).toContainText("Serverga ulanib bo‘lmadi.");
    await expect(page.getByTestId("enrolled-status")).toBeVisible();
    await expect(unenrollButton(page)).toBeEnabled();
    await expect(detailCount(page)).toHaveText("20 ta o‘quvchi");
  });

  test("an expired session (401) explains itself and links to sign-in", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER });
    await mockCoursesApi(page, { signedIn: false });
    await page.goto("/courses/python-asoslari");

    await enrollButton(page).click();
    const error = page.getByTestId("enroll-error");
    await expect(error).toContainText("Sessiyangiz tugagan.");
    await expect(error.getByRole("link", { name: "Kirish" })).toHaveAttribute(
      "href",
      "/login?next=%2Fcourses%2Fpython-asoslari",
    );
    await expect(enrollButton(page)).toBeEnabled();
  });
});

/* ------------------------------------------------------------------------ */

test.describe("header nav", () => {
  for (const signedIn of [false, true]) {
    test(`"Kurslar" is in the header for ${signedIn ? "members" : "guests"} and marks the current page`, async ({
      page,
    }) => {
      if (signedIn) await member(page);
      else await guest(page);
      await page.goto("/");
      const nav = page.getByRole("banner").getByRole("navigation").getByRole("link", { name: "Kurslar" });
      await expect(nav).toHaveAttribute("href", "/courses");
      await expect(nav).not.toHaveAttribute("aria-current", /.*/);

      await nav.click();
      await expect(page).toHaveURL(/\/courses$/);
      await expect(nav).toHaveAttribute("aria-current", "page");
      await expect(cards(page)).toHaveCount(6);

      // Still "current" inside a course.
      await cards(page).first().getByRole("link").click();
      await expect(page.getByTestId("course-detail")).toBeVisible();
      await expect(nav).toHaveAttribute("aria-current", "page");
    });
  }
});

/* ------------------------------------------------------------------------ */

test.describe("responsive layout", () => {
  const LONG_TITLE = "Juda-juda-uzun-sarlavhali-kurs-nomi-bo‘lsa-ham-sahifa-sig‘ishi-kerak";
  const longCourses = () => {
    const courses = makeCourses();
    courses[0]!.title = LONG_TITLE;
    courses[0]!.instructor = { id: 9, full_name: "Muhammadabdulaziz Abdurahmonov-Toshkentiy" };
    return courses;
  };

  const viewports = [
    { width: 1280, height: 800, columns: 3 },
    { width: 800, height: 900, columns: 2 },
    { width: 375, height: 740, columns: 1 },
  ];

  for (const vp of viewports) {
    test(`catalog and course page fit ${vp.width}px (${vp.columns}-column grid)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await member(page, { courses: longCourses() });

      await page.goto("/courses");
      await expect(cards(page)).toHaveCount(6);
      expect(await gridColumns(page)).toBe(vp.columns);
      expect(await noHorizontalScroll(page)).toBe(true);
      const nav = await page.getByRole("banner").getByRole("link", { name: "Kurslar" }).boundingBox();
      const signOut = await page.getByRole("banner").getByRole("button", { name: "Chiqish" }).boundingBox();
      expect(nav!.x + nav!.width).toBeLessThanOrEqual(signOut!.x);
      expect(signOut!.x + signOut!.width).toBeLessThanOrEqual(vp.width);

      await page.goto("/courses/python-asoslari");
      await expect(page.getByRole("heading", { level: 1, name: LONG_TITLE })).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
      const cta = await enrollButton(page).boundingBox();
      expect(cta!.x + cta!.width).toBeLessThanOrEqual(vp.width);

      await page.goto("/courses/bunday-kurs-yoq");
      await expect(page.getByTestId("course-not-found")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }

  test("guest views fit 375px too, and chips are 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await guest(page);
    await page.goto("/courses");
    await expect(cards(page)).toHaveCount(6);
    expect(await noHorizontalScroll(page)).toBe(true);

    for (const label of await page.getByTestId("level-filter").locator("label").all()) {
      expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    // Load more spans the content width on phones.
    const more = await loadMore(page).boundingBox();
    expect(more!.width).toBeGreaterThanOrEqual(375 - 2 * 16 - 1);

    await page.goto("/courses/python-asoslari");
    await expect(page.getByTestId("enroll-guest")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("on mobile the enrol panel comes before the long description", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await guest(page);
    await page.goto("/courses/python-asoslari");
    const panel = await page.getByTestId("enroll-panel").boundingBox();
    const about = await page.getByRole("heading", { name: "Kurs haqida" }).boundingBox();
    expect(panel!.y).toBeLessThan(about!.y);
  });
});
