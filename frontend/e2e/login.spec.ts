/*
 * Login page e2e against the built app with the API mocked at the network
 * layer (contract shapes identical to the Django backend).
 */
import { expect, test, type Page } from "@playwright/test";
import { BOT_URL, CSRF_TOKEN, mockAuthApi, tokenFor } from "./mockApi";

const liveRegion = (page: Page) => page.getByTestId("live-region");
const tokenTab = (page: Page) => page.getByRole("tab", { name: "Havola orqali" });
const codeTab = (page: Page) => page.getByRole("tab", { name: "Kod orqali" });
const codeInput = (page: Page) => page.getByLabel("Tasdiqlash kodi");
const submitButton = (page: Page) => page.getByRole("button", { name: "Tasdiqlash va kirish" });

test.describe("method 1 — deep link / token", () => {
  test("loads the token flow by default", async ({ page }) => {
    const calls = await mockAuthApi(page);
    await page.goto("/login");

    await expect(page.getByRole("heading", { level: 1, name: "Tizimga kirish" })).toBeVisible();
    await expect(tokenTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(codeTab(page)).toHaveAttribute("aria-selected", "false");

    const deepLink = page.getByRole("link", { name: /Telegram botga o‘tish/ });
    await expect(deepLink).toHaveAttribute("href", `${BOT_URL}?start=${tokenFor(0)}`);
    await expect(deepLink).toHaveAttribute("target", "_blank");
    await expect(page.getByTestId("copy-field-value")).toHaveText(tokenFor(0));
    await expect(page.getByTestId("token-countdown")).toContainText(/^.*(10:00|9:5\d)$/);
    await expect(liveRegion(page)).toContainText("Kirish havolasi tayyor");

    // CSRF cookie is fetched once, before the token request.
    expect(calls.order.slice(0, 2)).toEqual(["csrf", "token"]);
    expect(calls.csrf).toBe(1);
  });

  test("shows a skeleton while the token request is in flight", async ({ page }) => {
    await mockAuthApi(page, { tokenDelayMs: 1500 });
    await page.goto("/login");
    await expect(page.getByTestId("token-loading")).toBeVisible();
    await expect(page.getByTestId("token-loading")).toHaveAttribute("aria-busy", "true");
    await expect(page.getByTestId("token-ready")).toBeVisible();
    await expect(page.getByTestId("token-loading")).toHaveCount(0);
  });

  test("polls status and redirects to / once confirmed", async ({ page }) => {
    const calls = await mockAuthApi(page, {
      tokenStatus: (call) => (call < 1 ? "pending" : "confirmed"),
    });
    await page.goto("/login");

    await expect(page.getByTestId("signed-in")).toBeVisible({ timeout: 10_000 });
    await expect(liveRegion(page)).toContainText("Muvaffaqiyatli kirdingiz");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Siz tizimga kirdingiz" })).toBeVisible();
    expect(calls.status.every((t) => t === tokenFor(0))).toBe(true);
  });

  test("expired token stops polling and retries without a page reload", async ({ page }) => {
    const calls = await mockAuthApi(page, {
      tokenStatus: (_call, token) => (token === tokenFor(0) ? "expired" : "pending"),
    });
    await page.goto("/login");
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));

    await expect(page.getByTestId("token-expired")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Muddati tugadi" })).toBeVisible();
    await expect(liveRegion(page)).toContainText("Muddati tugadi");

    // Polling has stopped: no further status calls.
    const pollsAtExpiry = calls.status.length;
    await page.waitForTimeout(2600);
    expect(calls.status.length).toBe(pollsAtExpiry);

    await page.getByRole("button", { name: "Yangi havola olish" }).click();
    await expect(page.getByTestId("copy-field-value")).toHaveText(tokenFor(1));
    await expect(page.getByRole("link", { name: /Telegram botga o‘tish/ })).toHaveAttribute(
      "href",
      `${BOT_URL}?start=${tokenFor(1)}`,
    );
    expect(calls.token).toHaveLength(2);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(
      true,
    );
  });

  test("network failure shows an error state with a working retry", async ({ page }) => {
    const calls = await mockAuthApi(page, {
      tokenFailure: (call) => (call === 0 ? "network" : null),
    });
    await page.goto("/login");

    await expect(page.getByTestId("token-error")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Serverga ulanib bo‘lmadi" })).toBeVisible();
    await expect(liveRegion(page)).toContainText("Serverga ulanib bo‘lmadi");

    await page.getByRole("button", { name: "Qayta urinish" }).click();
    await expect(page.getByTestId("token-ready")).toBeVisible();
    expect(calls.token).toHaveLength(2);
  });

  test("rate-limited token request (429) explains itself", async ({ page }) => {
    await mockAuthApi(page, { tokenFailure: () => 429 });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Juda ko‘p urinish" })).toBeVisible();
  });

  test("copies the token to the clipboard with feedback", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await mockAuthApi(page);
    await page.goto("/login");

    await page.getByRole("button", { name: /Kirish tokeni: nusxalash/ }).click();
    await expect(page.getByTestId("token-ready").getByText("Nusxalandi!")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(tokenFor(0));
    await expect(page.getByTestId("token-ready").getByText("Nusxalandi!")).toBeHidden({
      timeout: 4000,
    });
  });
});

test.describe("tabs", () => {
  test("switch by click and keep typed code across switches", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");
    await expect(page.getByTestId("token-ready")).toBeVisible();

    await codeTab(page).click();
    await expect(codeTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("code-panel")).toBeVisible();
    await expect(page.getByTestId("token-ready")).toBeHidden();
    await expect(page.getByRole("link", { name: /Telegram botni ochish/ })).toHaveAttribute(
      "href",
      BOT_URL,
    );

    await codeInput(page).fill("123");
    await tokenTab(page).click();
    await expect(page.getByTestId("token-ready")).toBeVisible();
    await expect(page.getByTestId("code-panel")).toBeHidden();

    await codeTab(page).click();
    await expect(codeInput(page)).toHaveValue("123");
  });

  test("are operable with the keyboard and show a focus ring", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");
    await expect(page.getByTestId("token-ready")).toBeVisible();

    // First Tab stop on the page is the selected tab (roving tabindex).
    await page.keyboard.press("Tab");
    await expect(tokenTab(page)).toBeFocused();
    const ring = await tokenTab(page).evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ring).not.toBe("none");

    await page.keyboard.press("ArrowRight");
    await expect(codeTab(page)).toBeFocused();
    await expect(codeTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("code-panel")).toBeVisible();

    await page.keyboard.press("ArrowRight"); // wraps around
    await expect(tokenTab(page)).toBeFocused();
    await expect(tokenTab(page)).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("End");
    await expect(codeTab(page)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tokenTab(page)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(codeTab(page)).toHaveAttribute("aria-selected", "true");

    // Only one tab is in the Tab order; next stop is the active panel.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tabpanel", { name: "Kod orqali" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /Telegram botni ochish/ })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(codeInput(page)).toBeFocused();
  });
});

test.describe("method 2 — 5-digit code", () => {
  test("input strips non-digits and caps at 5", async ({ page }) => {
    await mockAuthApi(page);
    await page.goto("/login");
    await codeTab(page).click();
    const input = codeInput(page);
    await expect(input).toHaveAttribute("inputmode", "numeric");

    await input.pressSequentially("1a2-b 3x");
    await expect(input).toHaveValue("123");
    await input.fill("");
    await input.fill("9 8.7e6+5432");
    await expect(input).toHaveValue("98765");
    // Pasting a spaced code must keep all five digits.
    await input.fill("");
    await input.fill("12 345");
    await expect(input).toHaveValue("12345");
  });

  test("rejects short input client-side without calling the API", async ({ page }) => {
    const calls = await mockAuthApi(page);
    await page.goto("/login");
    await codeTab(page).click();
    await codeInput(page).fill("123");
    await submitButton(page).click();

    await expect(page.getByTestId("code-panel").getByText(/5 ta raqamdan iborat/)).toBeVisible();
    await expect(codeInput(page)).toHaveAttribute("aria-invalid", "true");
    await expect(codeInput(page)).toBeFocused();
    await expect(liveRegion(page)).toContainText("5 ta raqamdan iborat");
    expect(calls.verify).toHaveLength(0);

    // Editing clears the error.
    await codeInput(page).pressSequentially("45");
    await expect(codeInput(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  const failures = [
    { failure: "invalid", text: "Kod noto‘g‘ri" },
    { failure: "expired", text: "Kodning muddati tugagan" },
    { failure: "used", text: "allaqachon ishlatilgan" },
  ] as const;

  for (const { failure, text } of failures) {
    test(`shows the "${failure}" error and keeps the typed code`, async ({ page }) => {
      const calls = await mockAuthApi(page, { verify: () => ({ status: 400, failure }) });
      await page.goto("/login");
      await codeTab(page).click();
      await codeInput(page).fill("12345");
      await submitButton(page).click();

      await expect(page.getByTestId("code-panel").getByText(text)).toBeVisible();
      await expect(liveRegion(page)).toContainText(text);
      await expect(codeInput(page)).toHaveValue("12345");
      await expect(codeInput(page)).toHaveAttribute("aria-invalid", "true");
      await expect(page).toHaveURL(/\/login$/);

      expect(calls.verify).toEqual([
        { code: "12345", csrfHeader: CSRF_TOKEN, contentType: "application/json" },
      ]);
    });
  }

  test("a repeated identical error is re-announced", async ({ page }) => {
    await mockAuthApi(page, { verify: () => ({ status: 400, failure: "invalid" }) });
    await page.goto("/login");
    await codeTab(page).click();
    await codeInput(page).fill("12345");
    await submitButton(page).click();
    await expect(liveRegion(page)).toContainText("Kod noto‘g‘ri");
    const first = await liveRegion(page).textContent();
    await submitButton(page).click();
    // Raw textContent (toHaveText would normalise the alternating no-break space).
    await expect.poll(() => liveRegion(page).textContent()).not.toBe(first);
    await expect(liveRegion(page)).toContainText("Kod noto‘g‘ri");
  });

  test("valid code signs in and redirects to /", async ({ page }) => {
    const calls = await mockAuthApi(page);
    await page.goto("/login");
    await codeTab(page).click();
    await codeInput(page).fill("54321");
    await codeInput(page).press("Enter");

    await expect(page.getByTestId("signed-in")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Siz tizimga kirdingiz" })).toBeVisible();
    expect(calls.verify[0]).toMatchObject({ code: "54321", csrfHeader: CSRF_TOKEN });
  });
});

test.describe("responsive layout", () => {
  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "mobile", width: 375, height: 740 },
  ];

  for (const vp of viewports) {
    test(`no horizontal scroll at ${vp.width}px, on both tabs`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await mockAuthApi(page);
      await page.goto("/login");
      await expect(page.getByTestId("token-ready")).toBeVisible();

      const noOverflow = () =>
        page.evaluate(() => {
          const el = document.documentElement;
          return el.scrollWidth === el.clientWidth;
        });
      expect(await noOverflow()).toBe(true);

      await codeTab(page).click();
      await codeInput(page).fill("12345");
      expect(await noOverflow()).toBe(true);

      // Card is centred and capped on desktop, full-bleed on mobile.
      const intro = await page.getByRole("heading", { level: 1 }).boundingBox();
      expect(intro).not.toBeNull();
      if (vp.name === "mobile") {
        expect(intro!.x).toBeLessThanOrEqual(24);
      } else {
        expect(intro!.x).toBeGreaterThan(400);
      }
    });
  }

  test("tap targets are at least 44px tall on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await mockAuthApi(page);
    await page.goto("/login");
    await expect(page.getByTestId("token-ready")).toBeVisible();

    const targets = [
      tokenTab(page),
      codeTab(page),
      page.getByRole("link", { name: /Telegram botga o‘tish/ }),
      page.getByRole("button", { name: /nusxalash/ }),
    ];
    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await codeTab(page).click();
    for (const target of [
      page.getByRole("link", { name: /Telegram botni ochish/ }),
      codeInput(page),
      submitButton(page),
    ]) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});

test("unknown routes and an unauthenticated / land on /login", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/does-not-exist");
  await expect(page).toHaveURL(/\/login$/);
});
