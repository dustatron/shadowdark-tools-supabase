import { test, expect } from "@playwright/test";

test.describe("Magic Items - Create", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-id",
          email: "test@example.com",
          app_metadata: {},
          user_metadata: { username: "testuser" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Mock session
    await page.route("**/auth/v1/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "fake-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "fake-refresh-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            user_metadata: { username: "testuser" },
          },
        }),
      });
    });
  });

  test("should allow authenticated user to create a magic item", async ({
    page,
  }) => {
    // Mock the create API call
    await page.route("**/api/user/magic-items", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        expect(body).toMatchObject({
          name: "Test Magic Sword",
          type: "Weapon",
          description: "A powerful magical sword.",
          is_public: false,
        });

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "new-item-id",
            name: "Test Magic Sword",
            slug: "test-magic-sword",
            type: "Weapon",
            description: "A powerful magical sword.",
            is_public: false,
            user_id: "test-user-id",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/magic-items/create");

    // Fill out the form
    await page.fill('input[name="name"]', "Test Magic Sword");

    // Select type (assuming it's a select or combobox)
    // Note: Adjust selector based on actual implementation of MagicItemForm
    // For shadcn select, we might need to click the trigger then the option
    await page.click('button[role="combobox"]'); // Open type selector
    await page.click('div[role="option"]:has-text("Weapon")'); // Select Weapon

    await page.fill(
      'textarea[name="description"]',
      "A powerful magical sword.",
    );

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to the new item page or list
    // For now, let's assume it redirects to the item detail or list
    // We can check for a success message or URL change
    // await expect(page).toHaveURL(/\/magic-items/);
  });

  test("should show validation errors for empty required fields", async ({
    page,
  }) => {
    await page.goto("/magic-items/create");

    // Submit without filling anything
    await page.click('button[type="submit"]');

    // Check for validation errors
    // Adjust selectors based on how errors are displayed (e.g., text-red-500)
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Type is required")).toBeVisible();
    await expect(page.getByText("Description is required")).toBeVisible();
  });
});
