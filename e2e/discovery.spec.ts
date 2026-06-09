import { test, expect } from "@playwright/test";

/**
 * Shop discovery against the MSW-mocked GET /shops. No Mapbox token in e2e, so
 * the page renders list-only (the map shows its config notice) — the list and
 * "Book" deep-link are what we assert.
 */
test.describe("Shop discovery", () => {
  test("lists shops and links through to booking", async ({ page }) => {
    await page.goto("/discover");

    await expect(
      page.getByRole("heading", { name: /find a barbershop near you/i }),
    ).toBeVisible();

    // Mock discovery returns "Kingsway Cuts" (slug demo-shop).
    await expect(page.getByText("Kingsway Cuts")).toBeVisible();
    await expect(page.getByText(/km away/i)).toBeVisible();

    await page.getByRole("link", { name: /^book$/i }).first().click();
    await expect(page).toHaveURL(/\/book\/demo-shop/);
  });

  test("search input filters the discovery query", async ({ page }) => {
    await page.goto("/discover");
    await page.getByPlaceholder(/search shops or areas/i).fill("Kingsway");
    await expect(page.getByText("Kingsway Cuts")).toBeVisible();
  });
});
