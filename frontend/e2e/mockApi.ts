/*
 * Route-interception mocks that reproduce the backend contract exactly.
 * The mocked build uses VITE_API_BASE_URL=/api (same origin), so no CORS
 * plumbing is needed here.
 */
import type { Page, Request } from "@playwright/test";

export const CSRF_TOKEN = "e2e-csrf-token-value";
export const BOT_URL = "https://t.me/learn_test_bot";

/** Same shape as GET /api/accounts/me/ → 200. */
export interface MockUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  telegram_id: number | null;
  telegram_username: string;
}

export const E2E_USER: MockUser = {
  id: 1,
  username: "tg_777000222",
  first_name: "Diyorbek",
  last_name: "A",
  telegram_id: 777000222,
  telegram_username: "diyor",
};

export type TokenStatus = "pending" | "confirmed" | "expired";
export type VerifyResult = { status: 200 } | { status: 400; failure: "invalid" | "expired" | "used" };

export interface MockOptions {
  /** Decide the status for each poll (0-based call index, token being polled). */
  tokenStatus?: (call: number, token: string) => TokenStatus;
  verify?: (code: string, call: number) => VerifyResult;
  /** "network" aborts the request; a number answers with that HTTP status. */
  tokenFailure?: (call: number) => "network" | number | null;
  tokenDelayMs?: number;
  /**
   * Who the mocked session belongs to when the page loads (default: nobody).
   * A successful login (confirmed token or verified code) signs in as
   * `signInAs` (default E2E_USER); logout clears the session again.
   */
  user?: MockUser | null;
  signInAs?: MockUser;
  /** "network" aborts GET /me; a number answers with that HTTP status. */
  meFailure?: (call: number) => "network" | number | null;
  meDelayMs?: number;
  /** "network" aborts POST /logout; a number answers with that HTTP status. */
  logoutFailure?: (call: number) => "network" | number | null;
}

export interface ApiCalls {
  order: string[];
  csrf: number;
  token: string[];
  status: string[];
  verify: { code: string; csrfHeader: string | null; contentType: string | null }[];
  me: number;
  logout: { csrfHeader: string | null }[];
}

const VERIFY_DETAIL = {
  invalid: "Kod topilmadi yoki noto'g'ri.",
  used: "Bu kod allaqachon ishlatilgan.",
  expired: "Kodning amal qilish muddati tugagan.",
} as const;

export function tokenFor(call: number) {
  return `tok_e2e_${call}_` + "x".repeat(30);
}

export async function mockAuthApi(page: Page, options: MockOptions = {}): Promise<ApiCalls> {
  const calls: ApiCalls = { order: [], csrf: 0, token: [], status: [], verify: [], me: 0, logout: [] };
  let sessionUser: MockUser | null = options.user ?? null;
  const signIn = () => {
    sessionUser = options.signInAs ?? E2E_USER;
  };

  await page.route("**/api/accounts/csrf/", async (route) => {
    calls.order.push("csrf");
    calls.csrf += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Set-Cookie": `csrftoken=${CSRF_TOKEN}; Path=/; SameSite=Lax` },
      body: JSON.stringify({ detail: "ok" }),
    });
  });

  await page.route("**/api/accounts/telegram/token/", async (route, request: Request) => {
    if (request.method() !== "POST") return route.fallback();
    const call = calls.token.length;
    calls.order.push("token");
    const token = tokenFor(call);
    calls.token.push(token);

    const failure = options.tokenFailure?.(call) ?? null;
    if (failure === "network") return route.abort("internetdisconnected");
    if (typeof failure === "number") {
      return route.fulfill({
        status: failure,
        contentType: "application/json",
        body: JSON.stringify({ detail: "error" }),
      });
    }

    if (options.tokenDelayMs) await new Promise((r) => setTimeout(r, options.tokenDelayMs));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        token,
        deep_link: `${BOT_URL}?start=${token}`,
        expires_at: new Date(Date.now() + 600_000).toISOString(),
        expires_in_seconds: 600,
      }),
    });
  });

  await page.route("**/api/accounts/telegram/token/*/status/", async (route, request) => {
    const token = decodeURIComponent(new URL(request.url()).pathname.split("/").at(-3) ?? "");
    const call = calls.status.length;
    calls.status.push(token);
    calls.order.push("status");
    const status = options.tokenStatus?.(call, token) ?? "pending";
    if (status === "confirmed") signIn();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status }),
    });
  });

  await page.route("**/api/accounts/telegram/code/verify/", async (route, request) => {
    const { code } = request.postDataJSON() as { code: string };
    const headers = await request.allHeaders();
    calls.verify.push({
      code,
      csrfHeader: headers["x-csrftoken"] ?? null,
      contentType: headers["content-type"] ?? null,
    });
    calls.order.push("verify");
    const result = options.verify?.(code, calls.verify.length - 1) ?? { status: 200 };
    if (result.status === 200) {
      signIn();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "ok" }),
      });
    }
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ status: result.failure, detail: VERIFY_DETAIL[result.failure] }),
    });
  });

  await page.route("**/api/accounts/me/", async (route) => {
    const call = calls.me;
    calls.me += 1;
    calls.order.push("me");
    if (options.meDelayMs) await new Promise((r) => setTimeout(r, options.meDelayMs));

    const failure = options.meFailure?.(call) ?? null;
    if (failure === "network") return route.abort("internetdisconnected");
    if (typeof failure === "number") {
      return route.fulfill({
        status: failure,
        contentType: "application/json",
        body: JSON.stringify({ detail: "error" }),
      });
    }

    if (!sessionUser) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "not_authenticated" }),
      });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionUser),
    });
  });

  await page.route("**/api/accounts/logout/", async (route, request) => {
    if (request.method() !== "POST") return route.fallback();
    const headers = await request.allHeaders();
    const call = calls.logout.length;
    calls.logout.push({ csrfHeader: headers["x-csrftoken"] ?? null });
    calls.order.push("logout");

    const failure = options.logoutFailure?.(call) ?? null;
    if (failure === "network") return route.abort("internetdisconnected");
    if (typeof failure === "number") {
      return route.fulfill({
        status: failure,
        contentType: "application/json",
        body: JSON.stringify({ detail: "error" }),
      });
    }

    sessionUser = null;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
  });

  return calls;
}
