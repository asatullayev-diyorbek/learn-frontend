import { expect, test } from "@playwright/test";
import { E2E_USER, mockAuthApi } from "./mockApi";

test.describe("My Videos Page (/videos)", () => {
  test("guest visitor sees login prompt", async ({ page }) => {
    await mockAuthApi(page, { user: null });
    await page.goto("/videos");

    await expect(page.getByRole("heading", { name: "Tizimga kiring" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Telegram orqali kirish" })).toBeVisible();
  });

  test("authenticated user views their submissions list and filters by tab", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER });

    const mockSubmissions = [
      {
        id: 1,
        student_id: E2E_USER.id,
        telegram_file_id: "file_awaiting_1",
        topic: null,
        status: "awaiting_topic",
        status_display: "Mavzu biriktirilmagan",
        youtube_video_id: "",
        youtube_url: "",
        rejection_reason: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        student_id: E2E_USER.id,
        telegram_file_id: "file_approved_2",
        topic: {
          id: 10,
          title: "Komponentlar va Props",
          order: 1,
          course: { id: 5, title: "React Asoslari", slug: "react-asoslari" },
        },
        status: "approved",
        status_display: "Tasdiqlangan",
        youtube_video_id: "dQw4w9WgXcQ",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        rejection_reason: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await page.route("**/api/submissions/mine/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSubmissions),
      });
    });

    await page.route("**/api/submissions/available-topics/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 5,
            title: "React Asoslari",
            slug: "react-asoslari",
            topics: [{ id: 10, title: "Komponentlar va Props", order: 1 }],
          },
        ]),
      });
    });

    await page.goto("/videos");

    // Title and stats
    await expect(page.getByRole("heading", { name: "Mening videolarim" })).toBeVisible();
    await expect(page.getByText("Mavzu tanlanmagan 1")).toBeVisible();
    await expect(page.getByText("Tasdiqlangan 1")).toBeVisible();

    // Cards
    await expect(page.getByText("Ushbu video Telegram botdan qabul qilindi")).toBeVisible();
    await expect(page.getByText("React Asoslari")).toBeVisible();
    await expect(page.getByRole("link", { name: "YouTube'da ko'rish" })).toBeVisible();

    // Tab filtering
    await page.getByRole("tab", { name: /Tasdiqlangan/ }).click();
    await expect(page.getByText("Ushbu video Telegram botdan qabul qilindi")).not.toBeVisible();
    await expect(page.getByText("React Asoslari")).toBeVisible();
  });

  test("user can open bind topic modal and bind topic", async ({ page }) => {
    await mockAuthApi(page, { user: E2E_USER });

    let currentStatus = "awaiting_topic";
    let boundTopic: any = null;

    await page.route("**/api/submissions/mine/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 42,
            student_id: E2E_USER.id,
            telegram_file_id: "file_42",
            topic: boundTopic,
            status: currentStatus,
            status_display: currentStatus === "awaiting_topic" ? "Mavzu biriktirilmagan" : "Ko'rib chiqilmoqda",
            youtube_video_id: "",
            youtube_url: "",
            rejection_reason: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route("**/api/submissions/available-topics/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 7,
            title: "Django Asoslari",
            slug: "django-asoslari",
            topics: [{ id: 101, title: "Modellar va ORM", order: 1 }],
          },
        ]),
      });
    });

    await page.route("**/api/submissions/42/bind/", async (route) => {
      currentStatus = "pending_review";
      boundTopic = {
        id: 101,
        title: "Modellar va ORM",
        order: 1,
        course: { id: 7, title: "Django Asoslari", slug: "django-asoslari" },
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 42,
          student_id: E2E_USER.id,
          telegram_file_id: "file_42",
          topic: boundTopic,
          status: "pending_review",
          status_display: "Ko'rib chiqilmoqda",
          youtube_video_id: "",
          youtube_url: "",
          rejection_reason: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/videos");

    // Open modal
    await page.getByRole("button", { name: "Mavzuga biriktirish" }).click();
    await expect(page.getByRole("heading", { name: "Mavzuni tanlang va biriktiring" })).toBeVisible();

    // Select course then topic
    await page.getByLabel("Kursni tanlang").selectOption("7");
    await page.getByLabel("Mavzuni (Topic) tanlang").selectOption("101");

    // Submit
    await page.getByRole("button", { name: "Biriktirish va yuborish" }).click();

    // Verify status updated on page
    await expect(page.getByText("Ko'rib chiqilmoqda")).toBeVisible();
    await expect(page.getByText("Django Asoslari")).toBeVisible();
    await expect(page.getByText("1-dars: Modellar va ORM")).toBeVisible();
  });
});
