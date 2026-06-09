import { test, expect } from "@playwright/test";

/**
 * Customer self-service: cancel + reschedule a booking by code, against the
 * MSW-mocked backend. The mock booking is confirmed and starts in the future,
 * so it's modifiable.
 */
test.describe("Manage booking", () => {
  const url = "/book/demo-shop/manage?code=BK-TEST-1234";

  test("shows the booking and cancels it", async ({ page }) => {
    await page.goto(url);

    await expect(page.getByRole("heading", { name: /your booking/i })).toBeVisible();
    await expect(page.getByText("Skin Fade")).toBeVisible();

    await page.getByRole("button", { name: /cancel booking/i }).click();
    // Confirm inside the dialog.
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /cancel booking/i })
      .click();

    await expect(page.getByText(/this booking has been cancelled/i)).toBeVisible();
  });

  test("reschedules to a new time", async ({ page }) => {
    await page.goto(url);

    await page.getByRole("button", { name: /reschedule/i }).click();
    await expect(
      page.getByRole("heading", { name: /reschedule booking/i }),
    ).toBeVisible();

    // Pick the first available time (the current 9:00 slot is filtered out).
    await page.getByRole("button", { name: /9:45 AM/ }).click();
    await page.getByRole("button", { name: /confirm new time/i }).click();

    await expect(
      page.getByRole("heading", { name: /reschedule booking/i }),
    ).toBeHidden();
  });
});
