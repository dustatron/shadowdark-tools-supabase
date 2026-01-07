import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Admin Magic Item Editing
 * Feature: 020-update-site-logic
 *
 * Prerequisites:
 * - Admin user exists with is_admin = true
 * - Non-admin user exists
 * - User-created magic items exist
 * - Official magic items exist
 *
 * Note: These tests require test data setup. See quickstart.md for setup instructions.
 */

// Test configuration - update with actual test credentials
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@test.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "testpassword123";
const USER_EMAIL = process.env.TEST_USER_EMAIL || "user@test.com";
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || "testpassword123";

test.describe("Admin Magic Item Editing", () => {
  test.describe("Scenario 1: Admin can edit user magic item", () => {
    test("admin sees edit option on another user's magic item", async ({
      page,
    }) => {
      // Login as admin
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to magic items
      await page.goto("/magic-items");
      await page.waitForLoadState("networkidle");

      // Find a user-created magic item (not official)
      // Look for items with a user badge/indicator
      const magicItemCard = page
        .locator('[data-testid="magic-item-card"]')
        .first();
      await magicItemCard.click();

      // Wait for detail page
      await page.waitForURL(/\/magic-items\/.+/);

      // Open action menu
      const actionMenu = page.locator('button[aria-label="Entity actions"]');
      await actionMenu.click();

      // Verify Edit option is visible
      const editOption = page.locator("text=Edit");
      await expect(editOption).toBeVisible();
    });

    test("admin can modify and save another user's magic item", async ({
      page,
    }) => {
      // Login as admin
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to a user magic item detail page
      await page.goto("/magic-items");
      const magicItemCard = page
        .locator('[data-testid="magic-item-card"]')
        .first();
      await magicItemCard.click();

      // Open action menu and click Edit
      await page.locator('button[aria-label="Entity actions"]').click();
      await page.locator("text=Edit").click();

      // Wait for edit form
      await page.waitForURL(/\/magic-items\/.+\/edit/);

      // Modify the name
      const nameInput = page.locator('input[name="name"]');
      const originalName = await nameInput.inputValue();
      await nameInput.fill(`${originalName} (Admin Edited)`);

      // Save
      await page.click('button:has-text("Save")');

      // Verify redirect to detail page and update
      await page.waitForURL(/\/magic-items\/.+(?!\/edit)/);
      await expect(page.locator("h1")).toContainText("(Admin Edited)");
    });
  });

  test.describe("Scenario 2: Admin can edit official magic item with warning", () => {
    test("admin sees warning modal when editing official magic item", async ({
      page,
    }) => {
      // Login as admin
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to an official magic item (e.g., Bag of Holding)
      await page.goto("/magic-items/bag-of-holding");
      await page.waitForLoadState("networkidle");

      // Open action menu
      await page.locator('button[aria-label="Entity actions"]').click();

      // Click Edit
      await page.locator("text=Edit").click();

      // Verify warning modal appears
      const warningDialog = page.locator('[role="alertdialog"]');
      await expect(warningDialog).toBeVisible();
      await expect(warningDialog).toContainText("Edit Official Content");
      await expect(warningDialog).toContainText("Shadowdark core ruleset");
    });

    test("admin can proceed to edit after confirming warning", async ({
      page,
    }) => {
      // Login as admin
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to an official magic item
      await page.goto("/magic-items/bag-of-holding");

      // Open action menu and click Edit
      await page.locator('button[aria-label="Entity actions"]').click();
      await page.locator("text=Edit").click();

      // Confirm warning modal
      await page.locator('button:has-text("Continue")').click();

      // Verify navigation to edit page
      await page.waitForURL(/\/magic-items\/.+\/edit/);
      await expect(page.locator('input[name="name"]')).toBeVisible();
    });
  });

  test.describe("Scenario 3: Non-admin cannot edit others' items", () => {
    test("non-admin does not see edit option on others' items", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', USER_EMAIL);
      await page.fill('input[name="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to a magic item created by another user
      await page.goto("/magic-items");
      await page.waitForLoadState("networkidle");

      // Click on a magic item that's not owned by current user
      const magicItemCard = page
        .locator('[data-testid="magic-item-card"]')
        .first();
      await magicItemCard.click();

      // Open action menu
      await page.locator('button[aria-label="Entity actions"]').click();

      // Verify Edit option is NOT visible
      const editOption = page.locator('[role="menuitem"]:has-text("Edit")');
      await expect(editOption).not.toBeVisible();
    });

    test("non-admin cannot access edit page directly for others' items", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', USER_EMAIL);
      await page.fill('input[name="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Try to navigate directly to edit page of another user's item
      await page.goto("/magic-items/some-other-users-item/edit");

      // Should be redirected or show not found
      await expect(page).toHaveURL(/\/(magic-items|404|not-found)/);
    });
  });

  test.describe("Scenario 4: Owner can still edit own items", () => {
    test("owner sees edit option on own magic item", async ({ page }) => {
      // Login as regular user
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', USER_EMAIL);
      await page.fill('input[name="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to my items
      await page.goto("/magic-items/my-items");
      await page.waitForLoadState("networkidle");

      // Click on user's own magic item
      const ownItem = page.locator('[data-testid="magic-item-card"]').first();
      await ownItem.click();

      // Open action menu
      await page.locator('button[aria-label="Entity actions"]').click();

      // Verify Edit option is visible
      const editOption = page.locator("text=Edit");
      await expect(editOption).toBeVisible();
    });

    test("owner can edit own item without warning modal", async ({ page }) => {
      // Login as regular user
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', USER_EMAIL);
      await page.fill('input[name="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to my items and edit
      await page.goto("/magic-items/my-items");
      const ownItem = page.locator('[data-testid="magic-item-card"]').first();
      await ownItem.click();

      // Click Edit
      await page.locator('button[aria-label="Entity actions"]').click();
      await page.locator("text=Edit").click();

      // Verify no warning modal (go directly to edit page)
      await page.waitForURL(/\/magic-items\/.+\/edit/);
      const warningDialog = page.locator('[role="alertdialog"]');
      await expect(warningDialog).not.toBeVisible();
    });
  });

  test.describe("Scenario 5: Admin edit preserves original owner", () => {
    test("admin edit does not change item ownership", async ({ page }) => {
      // Login as admin
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|magic-items)/);

      // Navigate to a user magic item
      await page.goto("/magic-items");
      const userItem = page.locator('[data-testid="magic-item-card"]').first();
      await userItem.click();

      // Get original author info before edit
      const authorBefore = await page
        .locator('[data-testid="item-author"]')
        .textContent();

      // Edit the item
      await page.locator('button[aria-label="Entity actions"]').click();
      await page.locator("text=Edit").click();

      await page.waitForURL(/\/magic-items\/.+\/edit/);

      // Make a change
      const descInput = page.locator('textarea[name="description"]');
      const originalDesc = await descInput.inputValue();
      await descInput.fill(`${originalDesc} Updated by admin.`);

      // Save
      await page.click('button:has-text("Save")');

      // Verify owner is still the same
      await page.waitForURL(/\/magic-items\/.+(?!\/edit)/);
      const authorAfter = await page
        .locator('[data-testid="item-author"]')
        .textContent();
      expect(authorAfter).toBe(authorBefore);
    });
  });
});
