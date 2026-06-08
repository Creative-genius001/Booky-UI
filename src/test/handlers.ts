import { http, HttpResponse } from "msw";
import {
  mockAnalytics,
  mockBooking,
  mockBookingsList,
  mockBusinessDays,
  mockServices,
  mockSession,
  mockShop,
  mockSlots,
} from "@/test/fixtures";

/**
 * MSW request handlers shared by Vitest (node server) and the browser worker
 * used during Playwright e2e. Hosts are wildcarded (`*`) so they match the
 * configured API base URL regardless of origin. More specific paths are
 * declared before less specific ones (MSW matches in order).
 */
export const handlers = [
  // ---- Auth ----
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body?.email || !body?.password) {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }
    return HttpResponse.json(mockSession);
  }),
  http.post("*/auth/signup", () => HttpResponse.json(mockSession)),
  http.post("*/auth/refresh", () =>
    HttpResponse.json({
      accessToken: "refreshed-access-token",
      refreshToken: "refreshed-refresh-token",
    }),
  ),
  http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 })),

  // ---- Shops (specific before generic) ----
  http.get("*/shops/services/:id", ({ params }) => {
    const svc = mockServices.find((s) => s.id === params.id);
    return svc
      ? HttpResponse.json(svc)
      : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),
  http.get("*/shops/:id/services", () => HttpResponse.json(mockServices)),
  http.get("*/shops/:id/availability", () =>
    HttpResponse.json({ date: "2026-06-10", slots: mockSlots }),
  ),
  http.get("*/shops/:id/business-days", () =>
    HttpResponse.json(mockBusinessDays),
  ),
  http.get("*/shops/:id/blocked-dates", () => HttpResponse.json([])),
  http.get("*/shops/:id/analytics", () => HttpResponse.json(mockAnalytics)),
  http.post("*/shops/:id/business-days", () =>
    HttpResponse.json(mockBusinessDays),
  ),
  http.post("*/shops", () => HttpResponse.json(mockShop, { status: 201 })),
  http.patch("*/shops/:id", () => HttpResponse.json(mockShop)),
  http.get("*/shops/:idOrSlug", ({ params }) => {
    const key = params.idOrSlug;
    if (key === mockShop.slug || key === mockShop.id) {
      return HttpResponse.json(mockShop);
    }
    return HttpResponse.json({ message: "Shop not found" }, { status: 404 });
  }),

  // ---- Bookings ----
  http.post("*/bookings/initiate", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      booking: {
        ...mockBooking,
        status: "pending",
        paymentStatus: "pending",
        serviceId: body.serviceId ?? mockBooking.serviceId,
      },
    });
  }),
  http.get("*/bookings/:code", ({ params }) =>
    HttpResponse.json({ ...mockBooking, code: String(params.code) }),
  ),
  http.get("*/bookings", () =>
    HttpResponse.json({
      bookings: mockBookingsList,
      total: mockBookingsList.length,
      page: 1,
      pageSize: 50,
    }),
  ),
  http.patch("*/bookings/:id", async ({ request, params }) => {
    const body = (await request.json()) as { status?: string };
    return HttpResponse.json({
      ...mockBooking,
      id: String(params.id),
      status: body.status ?? mockBooking.status,
    });
  }),

  // ---- Payments ----
  // Echo the app-provided callbackUrl back as the Paystack authorization URL so
  // e2e redirects land on the in-app success page (no real Paystack needed).
  http.post("*/payments/init", async ({ request }) => {
    const body = (await request.json()) as { callbackUrl?: string };
    return HttpResponse.json({
      authorizationUrl: body.callbackUrl ?? "/",
      reference: "ref_test_123",
      accessCode: "access_test",
    });
  }),
];
