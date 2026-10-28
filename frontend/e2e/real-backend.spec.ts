/*
 * REAL end-to-end tests against the Django backend (no mocks).
 *
 * Opt-in: runs only with `npm run test:e2e:real` (E2E_REAL_BACKEND=1).
 * Prerequisites:
 *   1. Backend running on http://localhost:8000 (python manage.py runserver).
 *      Its default CORS_ALLOWED_ORIGINS already includes http://localhost:3000,
 *      where Playwright serves this app in real mode.
 *   2. E2E_BACKEND_DIR    — the Django project dir (default ../../learn-backend/backend)
 *      E2E_BACKEND_PYTHON — its interpreter (default <dir>/../.venv/bin/python)
 *      DJANGO_SETTINGS_MODULE / PYTHONPATH are passed through, so the "bot"
 *      below talks to the same database the server uses.
 *
 * The Telegram bot is simulated by calling the backend's own service layer
 * (confirm_auth_challenge / create_login_code) via `manage.py shell`, exactly
 * what the real bot handlers do.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ?? path.resolve(import.meta.dirname, "../../../learn-backend/backend");
const BACKEND_PYTHON =
  process.env.E2E_BACKEND_PYTHON ?? path.resolve(BACKEND_DIR, "../.venv/bin/python");

function django(script: string, env: Record<string, string> = {}): string {
  return execFileSync(BACKEND_PYTHON, ["manage.py", "shell", "-c", script], {
    cwd: BACKEND_DIR,
    env: { ...process.env, ...env },
    encoding: "utf8",
  }).trim();
}

/** Unique-ish Telegram ids so the backend's per-id code rate limit never bites. */
const runId = Date.now() % 1_000_000;
const tgId = (n: number) => String(7_000_000_000 + runId * 10 + n);

const bot = {
  confirmToken(token: string, telegramId: string) {
    return django(
      [
        "import os",
        "from apps.accounts.services import confirm_auth_challenge",
        "user, err = confirm_auth_challenge(os.environ['E2E_TOKEN'], int(os.environ['E2E_TG']), 'e2e_user', 'E2E', 'User')",
        "print(err or 'ok')",
      ].join("\n"),
      { E2E_TOKEN: token, E2E_TG: telegramId },
    );
  },
  createCode(telegramId: string) {
    const code = django(
      [
        "import os",
        "from apps.accounts.services import create_login_code",
        "code, err = create_login_code(int(os.environ['E2E_TG']), 'e2e_code', 'E2E', 'Code')",
        "print(code or err)",
      ].join("\n"),
      { E2E_TG: telegramId },
    );
    expect(code).toMatch(/^\d{5}$/);
    return code;
  },
  /** Back-dates expiry, as if the TTL had passed. */
  expireCode(code: string) {
    django(
      [
        "import os",
        "from datetime import timedelta",
        "from django.utils import timezone",
        "from apps.accounts.models import TelegramLoginCode",
        "from apps.accounts.services import _hash_value",
        "TelegramLoginCode.objects.filter(code_hash=_hash_value(os.environ['E2E_CODE'])).update(expires_at=timezone.now() - timedelta(seconds=1))",
      ].join("\n"),
      { E2E_CODE: code },
    );
  },
  expireToken(token: string) {
    django(
      [
        "import os",
        "from datetime import timedelta",
        "from django.utils import timezone",
        "from apps.accounts.models import TelegramAuthChallenge",
        "from apps.accounts.services import _hash_value",
        "TelegramAuthChallenge.objects.filter(token_hash=_hash_value(os.environ['E2E_TOKEN'])).update(expires_at=timezone.now() - timedelta(seconds=1))",
      ].join("\n"),
      { E2E_TOKEN: token },
    );
  },
};

async function readToken(page: Page) {
  await expect(page.getByTestId("token-ready")).toBeVisible({ timeout: 15_000 });
  const token = (await page.getByTestId("copy-field-value").textContent())?.trim() ?? "";
  expect(token.length).toBeGreaterThan(20);
  return token;
}

async function expectSessionCookie(page: Page) {
  const cookies = await page.context().cookies("http://localhost:8000");
  expect(cookies.map((c) => c.name)).toEqual(expect.arrayContaining(["sessionid", "csrftoken"]));
}

test.describe.serial("real backend", () => {
  test.skip(!process.env.E2E_REAL_BACKEND, "set E2E_REAL_BACKEND=1 to run against Django");

  test("method 1: bot confirms the token → browser is logged in", async ({ page }) => {
    await page.goto("/login");
    const token = await readToken(page);

    const deepLink = await page.getByRole("link", { name: /Telegram botga o‘tish/ }).getAttribute("href");
    expect(deepLink).toMatch(new RegExp(`^https://t\\.me/[^?]+\\?start=${token}$`));

    expect(bot.confirmToken(token, tgId(1))).toBe("ok");

    await expect(page.getByTestId("signed-in")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/localhost:3000\/$/);
    // Home renders the signed-in view from the real GET /api/accounts/me/.
    await expect(page.getByRole("heading", { level: 1, name: "Xush kelibsiz, E2E!" })).toBeVisible();
    await expectSessionCookie(page);
  });

  test("method 1: server-side expiry → 'Muddati tugadi' → fresh token", async ({ page }) => {
    await page.goto("/login");
    const token = await readToken(page);
    bot.expireToken(token);

    await expect(page.getByTestId("token-expired")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Yangi havola olish" }).click();
    const fresh = await readToken(page);
    expect(fresh).not.toBe(token);
  });

  test("method 2: invalid / expired / used codes, then a valid one logs in", async ({ page }) => {
    const expiredCode = bot.createCode(tgId(2));
    bot.expireCode(expiredCode);

    // A code that has already been redeemed (by another browser).
    const usedCode = bot.createCode(tgId(3));
    const redeem = await page.request.post("http://localhost:8000/api/accounts/telegram/code/verify/", {
      data: { code: usedCode },
    });
    expect(redeem.status()).toBe(200);
    await page.context().clearCookies();

    await page.goto("/login");
    await readToken(page);
    await page.getByRole("tab", { name: "Kod orqali" }).click();
    const botLink = page.getByRole("link", { name: /Telegram botni ochish/ });
    await expect(botLink).toHaveAttribute("href", /^https:\/\/t\.me\/[^?]+$/);

    const input = page.getByLabel("Tasdiqlash kodi");
    const submit = page.getByRole("button", { name: "Tasdiqlash va kirish" });
    const panel = page.getByTestId("code-panel");

    const cases: [string, string][] = [
      [expiredCode, "Kodning muddati tugagan"],
      [usedCode, "allaqachon ishlatilgan"],
    ];
    // An "invalid" code: any 5 digits that are neither of the above.
    const invalid = ["00000", "11111", "22222"].find((c) => c !== expiredCode && c !== usedCode)!;
    cases.unshift([invalid, "Kod noto‘g‘ri"]);

    for (const [code, message] of cases) {
      await input.fill(code);
      await submit.click();
      await expect(panel.getByText(message)).toBeVisible();
      await expect(page.getByTestId("live-region")).toContainText(message);
      await expect(input).toHaveValue(code);
    }

    const validCode = bot.createCode(tgId(4));
    await input.fill(validCode);
    await submit.click();
    await expect(page).toHaveURL(/localhost:3000\/$/, { timeout: 10_000 });
    await expectSessionCookie(page);
    await expect(page.getByRole("heading", { level: 1, name: "Xush kelibsiz, E2E!" })).toBeVisible();
    await expect(page.getByTestId("courses-invite")).toBeVisible();
  });

  test("home: a fresh visit reads the session from /me; guests get the landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-guest")).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Kirish" })).toBeVisible();

    const code = bot.createCode(tgId(5));
    const signIn = await page.request.post("http://localhost:8000/api/accounts/telegram/code/verify/", {
      data: { code },
    });
    expect(signIn.status()).toBe(200);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Xush kelibsiz, E2E!" })).toBeVisible();
    await expect(page.getByTestId("header-greeting")).toContainText("E2E");
  });

  test("home: Chiqish logs out against the real backend", async ({ page }) => {
    const code = bot.createCode(tgId(6));
    await page.request.post("http://localhost:8000/api/accounts/telegram/code/verify/", {
      data: { code },
    });
    await page.goto("/");
    await expect(page.getByTestId("home-member")).toBeVisible();

    await page.getByRole("banner").getByRole("button", { name: "Chiqish" }).click();
    await expect(page.getByTestId("home-guest")).toBeVisible({ timeout: 5_000 });
  });

  /* Courses — needs `python manage.py seed_courses` (10 courses, page size 9). */

  test("courses: the real catalog lists, paginates and filters", async ({ page }) => {
    await page.goto("/courses");
    const cards = page.getByTestId("course-card");
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const total = Number((await page.getByTestId("courses-count").textContent())?.match(/\d+/)?.[0]);
    expect(total).toBeGreaterThanOrEqual(10);
    await expect(cards).toHaveCount(9);

    await page.getByRole("button", { name: "Yana yuklash" }).click();
    await expect(cards).toHaveCount(Math.min(total, 18));

    await page.getByTestId("category-filter").getByRole("radio", { name: "Backend", exact: true }).click();
    await expect(page).toHaveURL(/category=backend/);
    await expect(page.getByTestId("courses-refreshing")).toHaveCount(0);
    for (const card of await cards.all()) await expect(card).toContainText("Backend");

    await page.getByRole("searchbox", { name: "Kurslarni qidirish" }).fill("python");
    await expect(page).toHaveURL(/search=python/);
    await expect(cards.filter({ hasText: "Python asoslari" })).toBeVisible();
  });

  test("courses: guest sees the sign-in CTA; an unknown slug is 'Kurs topilmadi'", async ({ page }) => {
    await page.goto("/courses/python-asoslari");
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kirish va kursga yozilish" })).toHaveAttribute(
      "href",
      "/login?next=%2Fcourses%2Fpython-asoslari",
    );

    await page.goto("/courses/bunday-kurs-yoq");
    await expect(page.getByRole("heading", { level: 1, name: "Kurs topilmadi" })).toBeVisible();
  });

  test("courses: enroll → unenroll round trip against the real API", async ({ page }) => {
    const code = bot.createCode(tgId(7));
    const signIn = await page.request.post("http://localhost:8000/api/accounts/telegram/code/verify/", {
      data: { code },
    });
    expect(signIn.status()).toBe(200);

    await page.goto("/courses/python-asoslari");
    const count = page.getByTestId("course-detail").locator("header").getByTestId("course-enrolled-count");
    await expect(count).toBeVisible({ timeout: 10_000 });
    const before = Number((await count.textContent())?.match(/\d+/)?.[0]);

    await page.getByRole("button", { name: "Kursga yozilish" }).click();
    await expect(page.getByTestId("enrolled-status")).toContainText("Yozilgansiz");
    await expect(count).toHaveText(`${before + 1} ta o‘quvchi`);

    // Persisted server-side: a reload still shows the enrolment.
    await page.reload();
    await expect(page.getByTestId("enrolled-status")).toBeVisible({ timeout: 10_000 });
    await expect(count).toHaveText(`${before + 1} ta o‘quvchi`);

    await page.getByRole("button", { name: "Kursdan chiqish" }).click();
    await expect(page.getByRole("button", { name: "Kursga yozilish" })).toBeVisible();
    await expect(count).toHaveText(`${before} ta o‘quvchi`);
    await page.reload();
    await expect(page.getByRole("button", { name: "Kursga yozilish" })).toBeVisible({ timeout: 10_000 });
  });

  test("courses: signing in from a course's CTA returns to that course against the real API", async ({
    page,
  }) => {
    await page.goto("/courses/python-asoslari");
    await page.getByRole("link", { name: "Kirish va kursga yozilish" }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Fcourses%2Fpython-asoslari$/);

    const code = bot.createCode(tgId(8));
    await page.getByRole("tab", { name: "Kod orqali" }).click();
    await page.getByLabel("Tasdiqlash kodi").fill(code);
    await page.getByRole("button", { name: "Tasdiqlash va kirish" }).click();

    await expect(page).toHaveURL(/\/courses\/python-asoslari$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1, name: "Python asoslari" })).toBeVisible();
  });
});
