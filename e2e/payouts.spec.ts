import { test, expect } from "@playwright/test";

/**
 * Owner payouts in Settings, against the MSW-mocked backend (wallet balance,
 * no bank account yet → the connect form is shown).
 */
test.describe("Payouts", () => {
  async function login(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
    await page.getByLabel("Password", { exact: true }).fill("supersecret");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  }

  test("shows the wallet balance and bank connect form", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/settings");

    await expect(page.getByText("Available balance")).toBeVisible();
    await expect(page.getByText("₦12,500")).toBeVisible();

    await expect(page.getByText("Payout account")).toBeVisible();
    // No account yet → the connect form (account-number input) is shown.
    await expect(page.getByPlaceholder("0123456789")).toBeVisible();
  });
});
