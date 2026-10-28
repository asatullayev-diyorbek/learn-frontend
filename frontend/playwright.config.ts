import { defineConfig, devices } from "@playwright/test";

/*
 * Two modes:
 *   npm run test:e2e        — mocked API (route interception), built app served by
 *                             `vite preview` on :4173 with VITE_API_BASE_URL=/api.
 *   npm run test:e2e:real   — real Django backend on :8000 (start it yourself, see
 *                             e2e/real-backend.spec.ts); app served on :3000, which
 *                             is in the backend's default CORS_ALLOWED_ORIGINS.
 *
 * Uses a locally installed Chromium (no browser download); override with
 * PLAYWRIGHT_CHROMIUM_PATH if yours lives elsewhere.
 */
const REAL_BACKEND = Boolean(process.env.E2E_REAL_BACKEND);
const PORT = REAL_BACKEND ? 3000 : 4173;
const OUT_DIR = REAL_BACKEND ? "dist-e2e-real" : "dist-e2e";
const API_BASE_URL = REAL_BACKEND
  ? (process.env.E2E_API_BASE_URL ?? "http://localhost:8000/api")
  : "/api";

export default defineConfig({
  testDir: "./e2e",
  testMatch: REAL_BACKEND ? /real-backend\.spec\.ts$/ : /\.spec\.ts$/,
  testIgnore: REAL_BACKEND ? [] : [/real-backend\.spec\.ts$/],
  fullyParallel: !REAL_BACKEND,
  workers: REAL_BACKEND ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
        },
      },
    },
  ],
  webServer: {
    command: `npx vite build --outDir ${OUT_DIR} --emptyOutDir && npx vite preview --outDir ${OUT_DIR} --port ${PORT} --strictPort`,
    env: { VITE_API_BASE_URL: API_BASE_URL },
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
