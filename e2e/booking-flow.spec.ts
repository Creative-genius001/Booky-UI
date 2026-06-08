import { test, expect } from "@playwright/test";

/**
 * Full customer booking journey against the MSW-mocked backend:
 * shop → service → date → time → details → payment → success.
 * The payments mock echoes the app's callback URL back as the Paystack
 * authorization URL, so the redirect lands on the in-app success page.
 */
test.describe("Customer booking flow", () => {
  test("books a service end to end and reaches confirmation", async ({ page }) => {
    await page.goto("/book/demo-shop");

    // Shop loads
    await expect(
      page.getByRole("heading", { name: "Kingsway Cuts" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Choose a service" }),
    ).toBeVisible();

    // 1. Service
    await page.getByRole("button", { name: /Skin Fade/ }).click();

    // 2. Date — pick the first selectable day in the calendar
    await expect(
      page.getByRole("heading", { name: "Pick a date" }),
    ).toBeVisible();
    // Day cells carry an aria-label ending in the year; pick the first enabled one.
    await page.locator('button[aria-label$="2026"]:not([disabled])').first().click();

    // 3. Time
    await expect(
      page.getByRole("heading", { name: "Select a time" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /9:00 AM/ }).click();

    // 4. Details
    await expect(
      page.getByRole("heading", { name: "Your details" }),
    ).toBeVisible();
    await page.getByLabel(/full name/i).fill("John Doe");
    await page.getByLabel(/email/i).fill("john@example.com");
    await page.getByLabel(/phone number/i).fill("+2348012345678");
    await page.getByRole("button", { name: /continue/i }).first().click();

    // 5. Payment
    await expect(
      page.getByRole("heading", { name: "Confirm & pay" }),
    ).toBeVisible();
    await expect(page.getByText("John Doe")).toBeVisible();
    await page.getByRole("button", { name: /Pay ₦5,000/ }).click();

    // 6. Success (redirected back via the mocked Paystack callback)
    await expect(
      page.getByRole("heading", { name: /you're booked/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("BK-TEST-1234")).toBeVisible();
  });

  test("shows a not-found state for an unknown shop", async ({ page }) => {
    await page.goto("/book/this-shop-does-not-exist");
    await expect(
      page.getByRole("heading", { name: /shop not found/i }),
    ).toBeVisible();
  });
});
