import { http, HttpResponse } from "msw";
import {
  mockAnalytics,
  mockBookingItem,
  mockBookingsList,
  mockBusinessDays,
  mockInitiateResult,
  mockServices,
  mockSession,
  mockShop,
  mockSlots,
} from "@/test/fixtures";

/** Wrap a payload in the backend's success envelope. */
const data = (payload: unknown, status = 200) =>
  HttpResponse.json({ data: payload }, { status });

/** The backend error envelope. */
const fail = (status: number, error: string) =>
  HttpResponse.json({ error, code: status }, { status });

/**
 * MSW handlers mirroring the Go backend: snake_case bodies, the `{ data }`
 * success envelope and the `{ error, code }` error envelope. Hosts are
 * wildcarded so they match the configured API base regardless of origin, and
 * more specific paths precede generic ones (MSW matches in order).
 */
export const handlers = [
  // ---- Auth ----
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body?.email || !body?.password) {
      return fail(400, "Invalid credentials");
    }
    return data(mockSession);
  }),
  http.post("*/auth/signup", () => data(mockSession, 201)),
  http.post("*/auth/refresh", () =>
    data({
      user: mockSession.user,
      tokens: {
        access_token: "refreshed-access-token",
        refresh_token: "refreshed-refresh-token",
        refresh_expires_at: "2026-07-10T09:00:00Z",
      },
    }),
  ),
  http.post("*/auth/logout", () => data({ message: "logged out" })),
  http.post("*/auth/forgot-password", () =>
    data({ message: "if an account exists, a reset link has been sent" }),
  ),
  http.post("*/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { token?: string; password?: string };
    if (!body?.token) return fail(400, "reset token is invalid or has expired");
    return data({ message: "password updated" });
  }),
  http.post("*/auth/verify-email", async ({ request }) => {
    const body = (await request.json()) as { token?: string };
    if (!body?.token) return fail(400, "verification token is invalid or has expired");
    return data({ message: "email verified" });
  }),
  http.post("*/auth/resend-verification", () =>
    data({ message: "if your account needs verification, a new link has been sent" }),
  ),

  // ---- Shops (specific before generic) ----
  http.get("*/shops", () =>
    data({
      shops: [
        {
          id: mockShop.id,
          name: mockShop.name,
          slug: mockShop.slug,
          address: "12 Marina Rd, Lagos",
          phone: mockShop.phone,
          logo_url: "",
          cover_image_url: "",
          latitude: 6.45,
          longitude: 3.4,
          distance_km: 1.2,
        },
      ],
      total: 1,
      page: 1,
      page_size: 20,
    }),
  ),
  http.get("*/shops/mine", () => data([mockShop])),
  http.get("*/shops/:id/bookings", () =>
    data({
      bookings: mockBookingsList,
      total: mockBookingsList.length,
      page: 1,
      page_size: 20,
    }),
  ),
  http.get("*/shops/:id/analytics", () => data(mockAnalytics)),

  // ---- Payouts ----
  http.get("*/payouts/banks", () =>
    data([
      { name: "Access Bank", code: "044", slug: "access-bank" },
      { name: "GTBank", code: "058", slug: "gtbank" },
    ]),
  ),
  http.get("*/shops/:id/bank-account", () => data(null)),
  http.post("*/shops/:id/bank-account", async ({ request, params }) => {
    const body = (await request.json()) as { bank_code?: string; account_number?: string };
    return data({
      id: "bank-1",
      shop_id: String(params.id),
      bank_code: body.bank_code ?? "058",
      bank_name: "GTBank",
      account_number: body.account_number ?? "0123456789",
      account_name: "KINGSWAY CUTS LTD",
    });
  }),
  http.get("*/shops/:id/wallet", () => data({ balance_kobo: 1250000, currency: "NGN" })),
  http.get("*/shops/:id/wallet/entries", () =>
    data({ entries: [], total: 0, page: 1, page_size: 20 }),
  ),
  http.get("*/shops/:id/withdrawals", () => data({ withdrawals: [], total: 0 })),
  http.post("*/shops/:id/withdrawals", async ({ request, params }) => {
    const body = (await request.json()) as { amount_kobo?: number };
    return data(
      {
        id: "wd-1",
        shop_id: String(params.id),
        amount_kobo: body.amount_kobo ?? 0,
        status: "processing",
        reference: "WD-TEST123",
      },
      201,
    );
  }),
  http.get("*/shops/services/:id", ({ params }) => {
    const svc = mockServices.find((s) => s.id === params.id);
    return svc ? data(svc) : fail(404, "service not found");
  }),
  http.get("*/shops/:id/services", () => data(mockServices)),
  http.get("*/shops/:id/availability", () => data(mockSlots)),
  http.get("*/shops/:id/business-days", () => data(mockBusinessDays)),
  http.get("*/shops/:id/blocked-dates", () => data([])),
  http.post("*/shops/:id/business-days", () =>
    data({ shop: mockShop, business_days: mockBusinessDays }),
  ),
  http.post("*/shops", () => data(mockShop, 201)),
  http.patch("*/shops/:id", () => data(mockShop)),
  http.get("*/shops/:idOrSlug", ({ params }) => {
    const key = params.idOrSlug;
    if (key === mockShop.slug || key === mockShop.id) return data(mockShop);
    return fail(404, "shop not found");
  }),

  // ---- Bookings ----
  // The authorization URL points at the in-app success page so e2e redirects
  // stay on-site (no real Paystack needed).
  http.post("*/bookings/initiate", async ({ request }) => {
    const body = (await request.json()) as { service_id?: string };
    return data(
      {
        ...mockInitiateResult,
        booking: {
          ...mockInitiateResult.booking,
          service_id: body.service_id ?? mockInitiateResult.booking.service_id,
        },
        authorization_url: `/payment/callback?reference=${mockInitiateResult.payment.reference}`,
      },
      201,
    );
  }),
  http.get("*/bookings/:code", ({ params }) =>
    data({ ...mockBookingItem, code: String(params.code) }),
  ),
  http.post("*/bookings/cancel", async ({ request }) => {
    const body = (await request.json()) as { code?: string };
    return data({
      ...mockBookingItem,
      code: body.code ?? mockBookingItem.code,
      status: "cancelled",
      payment_status: "refunded",
    });
  }),
  http.post("*/bookings/reschedule", async ({ request }) => {
    const body = (await request.json()) as { code?: string; start_time?: string };
    return data({
      ...mockBookingItem,
      code: body.code ?? mockBookingItem.code,
      starts_at: body.start_time ?? mockBookingItem.starts_at,
    });
  }),

  // ---- Payments ----
  http.post("*/payments/init", () => data(mockInitiateResult)),
];
