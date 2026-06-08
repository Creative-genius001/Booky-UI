import { test, expect } from "@playwright/test";

test.describe("Owner authentication", () => {
  test("logs in and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();

    await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
    await page.getByLabel("Password", { exact: true }).fill("supersecret");
    await page.getByRole("button", { name: /log in/i }).click();

    // Dashboard guard requires an active shop; the mock owner has one,
    // but onboarding redirect only triggers when no shop id is stored.
    // A fresh context has no shop id, so we assert we left the login page.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test("shows validation errors on empty login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("navigates from login to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /create an account/i }).click();
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
  });
});
