import { expect, test } from "@playwright/test";
import { E2E_USER, mockAuthApi } from "./mockApi";
import { mockCoursesApi } from "./mockCoursesApi";

test.describe("Lesson Detail Page (/courses/:slug/topics/:topicId)", () => {
  test("clicking a topic on CourseDetailPage opens LessonDetailPage with YouTube player and sidebar", async ({
    page,
  }) => {
    await mockAuthApi(page, { user: E2E_USER });
    await mockCoursesApi(page, { signedIn: true });

    await page.goto("/courses/python-asoslari");
    const firstTopicLink = page.getByTestId("course-topic-link").first();
    await expect(firstTopicLink).toContainText("O'zgaruvchilar va ma'lumot turlari");
    await firstTopicLink.click();

    await expect(page).toHaveURL("/courses/python-asoslari/topics/1");
    await expect(
      page.getByRole("heading", { level: 1, name: "O'zgaruvchilar va ma'lumot turlari" }),
    ).toBeVisible();

    // Approved video is rendered inside iframe stage and shows author attribution
    await expect(page.getByTestId("lesson-player-stage").locator("iframe")).toBeVisible();
    await expect(page.getByTestId("lesson-video-author")).toContainText("Ali Valiyev");

    // Sidebar lists all 3 topics and highlights the current one
    const sidebarItems = page.getByTestId("lesson-sidebar-topics").locator("li");
    await expect(sidebarItems).toHaveCount(3);

    // Next lesson pager works and navigates to topic 2 (which has no video yet -> empty contribution stage)
    const nextLink = page.getByTestId("lesson-next-link");
    await expect(nextLink).toContainText("Shart operatorlari");
    await nextLink.click();

    await expect(page).toHaveURL("/courses/python-asoslari/topics/2");
    await expect(page.getByRole("heading", { level: 1, name: "Shart operatorlari" })).toBeVisible();
    await expect(page.getByTestId("lesson-no-video")).toBeVisible();
    await expect(page.getByTestId("lesson-prev-link")).toContainText(
      "O'zgaruvchilar va ma'lumot turlari",
    );
  });

  test("unknown topic ID shows lesson-not-found state with link back to course", async ({ page }) => {
    await mockAuthApi(page);
    await mockCoursesApi(page);

    await page.goto("/courses/python-asoslari/topics/999");
    const notFound = page.getByTestId("lesson-not-found");
    await expect(notFound.getByRole("heading", { level: 1, name: "Dars mavzusi topilmadi" })).toBeVisible();
    await notFound.getByRole("link", { name: "Kurs sahifasiga qaytish" }).click();
    await expect(page).toHaveURL("/courses/python-asoslari");
  });
});
