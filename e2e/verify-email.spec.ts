import { test, expect } from "@playwright/test";

test.describe("Email verification", () => {
  test("verifies via the email link token", async ({ page }) => {
    await page.goto("/verify-email?token=valid-token-123");
    await expect(
      page.getByRole("heading", { name: /email verified/i }),
    ).toBeVisible();
  });

  test("shows the check-your-inbox state without a token", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(
      page.getByRole("heading", { name: /check your inbox/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /continue to setup/i })).toBeVisible();
  });
});
