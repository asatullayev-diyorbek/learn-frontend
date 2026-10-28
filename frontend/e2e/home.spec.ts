/*
 * Home page (/) e2e against the built app, API mocked at the network layer
 * (GET /api/accounts/me/ and POST /api/accounts/logout/ shapes identical to
 * the Django backend).
 */
import { expect, test, type Page } from "@playwright/test";
import { CSRF_TOKEN, E2E_USER, mockAuthApi } from "./mockApi";
import { mockCoursesApi } from "./mockCoursesApi";

const header = (page: Page) => page.getByRole("banner");
const account = (page: Page) => page.getByTestId("header-account");
const signInLink = (page: Page) => header(page).getByRole("link", { name: "Kirish" });
const signOutButton = (page: Page) => header(page).getByRole("button", { name: "Chiqish" });
const heroCta = (page: Page) => page.getByRole("link", { name: "Telegram orqali kirish" });
const welcome = (page: Page, name: string) =>
  page.getByRole("heading", { level: 1, name: `Xush kelibsiz, ${name}!` });

const markNoReload = (page: Page) =>
  page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
const stillNoReload = (page: Page) =>
  page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true);

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth === el.clientWidth;
  });

test.describe("guest", () => {
  test("renders the landing page: hero, CTA and features", async ({ page }) => {
    const calls = await mockAuthApi(page);
    await page.goto("/");

    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Yangi bilimlarni o‘z sur’atingizda o‘rganing" }),
    ).toBeVisible();
    await expect(heroCta(page)).toBeVisible();
    await expect(heroCta(page)).toHaveAttribute("href", "/login");

    await expect(page.getByRole("heading", { level: 2, name: "Learn nimaga yordam beradi" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(4);

    await expect(page).toHaveTitle("Learn — onlayn ta’lim platformasi");
    await expect(page.getByRole("contentinfo")).toContainText("Learn");

    // /me is fetched exactly once for the header + page together.
    expect(calls.me).toBe(1);
  });

  test('header shows "Kirish" linking to /login, and it navigates in-app', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/");

    await expect(signInLink(page)).toHaveAttribute("href", "/login");
    await expect(signOutButton(page)).toHaveCount(0);
    await expect(header(page).getByRole("link", { name: "Learn — bosh sahifa" })).toHaveAttribute(
      "href",
      "/",
    );

    await markNoReload(page);
    await signInLink(page).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tizimga kirish" })).toBeVisible();
    expect(await stillNoReload(page)).toBe(true);
  });

  test("hero CTA goes to /login", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/");
    await heroCta(page).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("token-ready")).toBeVisible();
  });

  test("header and CTA are keyboard-reachable with a visible focus ring", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/");
    await expect(page.getByTestId("home-guest")).toBeVisible();

    const order = [
      header(page).getByRole("link", { name: "Learn — bosh sahifa" }),
      header(page).getByRole("link", { name: "Kurslar" }),
      signInLink(page),
      heroCta(page),
    ];
    for (const target of order) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      const ring = await target.evaluate((el) => getComputedStyle(el).boxShadow);
      expect(ring).not.toBe("none");
    }

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("loading", () => {
  test("shows skeletons in the page and the header slot, without a header jump", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER, meDelayMs: 1200 });
    await page.goto("/");

    await expect(page.getByTestId("home-loading")).toBeVisible();
    await expect(page.getByTestId("home-loading")).toHaveAttribute("aria-busy", "true");
    await expect(account(page)).toHaveAttribute("data-status", "loading");
    const before = await header(page).boundingBox();
    const slotBefore = await account(page).boundingBox();

    await expect(welcome(page, "Diyorbek")).toBeVisible();
    await expect(page.getByTestId("home-loading")).toHaveCount(0);
    const after = await header(page).boundingBox();
    const slotAfter = await account(page).boundingBox();

    expect(after?.height).toBe(before?.height);
    expect(slotAfter?.height).toBe(slotBefore?.height);
    expect(slotAfter?.y).toBe(slotBefore?.y);
  });
});

test.describe("authenticated", () => {
  test("greets the user and invites them into the course catalog", async ({ page }) => {
    const calls = await mockAuthApi(page, { user: E2E_USER });
    await mockCoursesApi(page, { signedIn: true });
    await page.goto("/");

    await expect(welcome(page, "Diyorbek")).toBeVisible();
    await expect(page.getByTestId("header-greeting")).toContainText("Diyorbek");
    await expect(signOutButton(page)).toBeVisible();
    await expect(signInLink(page)).toHaveCount(0);

    // No stale "coming soon": the card points at the real catalog.
    const invite = page.getByTestId("courses-invite");
    await expect(invite.getByRole("heading", { name: "O‘qishni boshlang" })).toBeVisible();
    await expect(page.getByText("tez orada qo‘shiladi")).toHaveCount(0);
    const browse = invite.getByRole("link", { name: "Kurslarni ko‘rish" });
    await expect(browse).toHaveAttribute("href", "/courses");

    // The guest landing is not shown to signed-in users.
    await expect(page.getByTestId("home-guest")).toHaveCount(0);
    expect(calls.me).toBe(1);

    await browse.click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByRole("heading", { level: 1, name: "Kurslar" })).toBeVisible();
  });

  const fallbacks = [
    { label: "Telegram username without a first name", first_name: "", telegram_username: "diyor", expected: "@diyor" },
    { label: "neither first name nor username", first_name: "  ", telegram_username: "", expected: "Foydalanuvchi" },
  ];
  for (const { label, first_name, telegram_username, expected } of fallbacks) {
    test(`display name falls back for ${label}`, async ({ page }) => {
      await mockAuthApi(page, { user: { ...E2E_USER, first_name, telegram_username } });
      await page.goto("/");
      await expect(welcome(page, expected)).toBeVisible();
      await expect(page.getByTestId("header-greeting")).toContainText(expected);
    });
  }

  test("logout returns to the guest header and landing in place", async ({ page }) => {
    const calls = await mockAuthApi(page, { user: E2E_USER });
    await page.goto("/");
    await expect(welcome(page, "Diyorbek")).toBeVisible();
    await markNoReload(page);

    await signOutButton(page).click();

    await expect(signInLink(page)).toBeVisible();
    await expect(signInLink(page)).toBeFocused();
    await expect(page.getByTestId("header-greeting")).toHaveCount(0);
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(page.getByTestId("live-region")).toHaveText("Tizimdan chiqdingiz.");
    expect(await stillNoReload(page)).toBe(true);

    // CSRF cookie obtained first, then sent as X-CSRFToken.
    expect(calls.logout).toEqual([{ csrfHeader: CSRF_TOKEN }]);
    expect(calls.order.indexOf("csrf")).toBeLessThan(calls.order.indexOf("logout"));
    // Logging out must not refetch /me.
    expect(calls.me).toBe(1);

    // The session is really gone: a reload stays a guest.
    await page.reload();
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(signInLink(page)).toBeVisible();
  });

  test("a failed logout keeps the user signed in and says so", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER, logoutFailure: (call) => (call === 0 ? 500 : null) });
    await page.goto("/");
    await expect(welcome(page, "Diyorbek")).toBeVisible();

    await signOutButton(page).click();
    const alertTitle = page.getByRole("main").getByText("Tizimdan chiqib bo‘lmadi", { exact: true });
    await expect(alertTitle).toBeVisible();
    await expect(page.getByTestId("live-region")).toContainText("Tizimdan chiqib bo‘lmadi");
    await expect(welcome(page, "Diyorbek")).toBeVisible();
    await expect(signOutButton(page)).toBeEnabled();

    // Second attempt succeeds and clears the alert.
    await signOutButton(page).click();
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(alertTitle).toHaveCount(0);
  });
});

test.describe("errors", () => {
  test("network failure on /me shows the error state with a working retry", async ({ page }) => {
    const calls = await mockAuthApi(page, { meFailure: (call) => (call === 0 ? "network" : null) });
    await page.goto("/");

    const error = page.getByTestId("home-error");
    await expect(error).toBeVisible();
    await expect(error.getByRole("heading", { level: 1, name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    // Unknown session → offer sign-in, never a fake greeting.
    await expect(signInLink(page)).toBeVisible();

    await error.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(page.getByTestId("home-guest")).toBeVisible();
    expect(calls.me).toBe(2);
  });

  test("a 5xx on /me is a server error, not a guest", async ({ page }) => {
    await mockAuthApi(page, { meFailure: () => 500 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Nimadir noto‘g‘ri ketdi" })).toBeVisible();
    await expect(page.getByTestId("home-guest")).toHaveCount(0);
  });
});

test.describe("responsive layout", () => {
  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "mobile", width: 375, height: 740 },
  ];

  for (const vp of viewports) {
    test(`no horizontal scroll at ${vp.width}px, guest and signed in`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await mockAuthApi(page);
      await page.goto("/");
      await expect(page.getByTestId("home-guest")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);

      const hero = await page.getByRole("heading", { level: 1 }).boundingBox();
      expect(hero).not.toBeNull();
      expect(hero!.x).toBeLessThanOrEqual(vp.name === "mobile" ? 24 : 120);
      expect(hero!.x + hero!.width).toBeLessThanOrEqual(vp.width);

      // Signed in, with a long name that must truncate rather than overflow.
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await mockAuthApi(page, {
        user: { ...E2E_USER, first_name: "Muhammadabdulaziz-Abdurahmonov" },
      });
      await page.reload();
      await expect(page.getByTestId("home-member")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
      const button = await signOutButton(page).boundingBox();
      expect(button!.x + button!.width).toBeLessThanOrEqual(vp.width);
    });
  }

  test("tap targets are at least 44px tall on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await mockAuthApi(page);
    await page.goto("/");
    await expect(page.getByTestId("home-guest")).toBeVisible();

    for (const target of [signInLink(page), heroCta(page)]) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    // Primary CTA spans the content width on phones.
    const cta = await heroCta(page).boundingBox();
    expect(cta!.width).toBeGreaterThanOrEqual(375 - 2 * 16 - 1);
  });
});

test("unknown routes land on the home page", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/does-not-exist");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home-guest")).toBeVisible();
});
