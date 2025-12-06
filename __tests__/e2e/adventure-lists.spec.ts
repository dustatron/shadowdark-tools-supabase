import { test, expect } from "@playwright/test";

test.describe("Adventure Lists", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-id",
          email: "test@example.com",
          role: "authenticated",
        }),
      });
    });

    // Mock user profile
    await page.route("**/rest/v1/user_profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-id",
          username: "testuser",
          is_admin: false,
        }),
      });
    });
  });

  test("should navigate to adventure lists page", async ({ page }) => {
    await page.goto("/adventure-lists");
    await expect(
      page.getByRole("heading", { name: "Adventure Lists" }),
    ).toBeVisible();
  });

  test("should show create new list button", async ({ page }) => {
    await page.goto("/adventure-lists");
    await expect(
      page.getByRole("link", { name: "Create New List" }),
    ).toBeVisible();
  });

  test("should navigate to create list page", async ({ page }) => {
    await page.goto("/adventure-lists");
    await page.getByRole("link", { name: "Create New List" }).click();
    await expect(page).toHaveURL("/adventure-lists/new");
    await expect(
      page.getByRole("heading", { name: "Create New Adventure List" }),
    ).toBeVisible();
  });

  test("should show form fields on create page", async ({ page }) => {
    await page.goto("/adventure-lists/new");
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel("Notes")).toBeVisible();
    await expect(page.getByLabel("Image URL")).toBeVisible();
    await expect(page.getByLabel("Make Public")).toBeVisible();
  });
});
