import type {
  AnalyticsSummary,
  AuthResult,
  AvailableSlot,
  BookingListItem,
  BusinessDay,
  InitiateResult,
  Service,
  Shop,
} from "@/types";

/** Shared mock data matching the backend JSON contracts (snake_case). */

export const mockShop: Shop = {
  id: "11111111-1111-1111-1111-111111111111",
  owner_id: "99999999-9999-9999-9999-999999999999",
  name: "Kingsway Cuts",
  slug: "demo-shop",
  email: "shop@example.com",
  phone: "+234 800 000 0000",
  timezone: "Africa/Lagos",
  is_active: true,
  barbing_duration: 45,
  capacity_per_slot: 3,
};

export const mockServices: Service[] = [
  {
    id: "svc-1",
    shop_id: mockShop.id,
    name: "Skin Fade",
    description: "Sharp, clean fade with a razor finish.",
    price: 5000,
    duration_in_minutes: 45,
    is_active: true,
  },
  {
    id: "svc-2",
    shop_id: mockShop.id,
    name: "Beard Trim",
    description: "Shape-up and hot towel finish.",
    price: 2500,
    duration_in_minutes: 20,
    is_active: true,
  },
  {
    id: "svc-3",
    shop_id: mockShop.id,
    name: "Kids Cut",
    description: "Quick and friendly cut for under-12s.",
    price: 3000,
    duration_in_minutes: 30,
    is_active: false,
  },
];

export const mockSlots: AvailableSlot[] = [
  { start: "2026-06-10T09:00:00+01:00", end: "2026-06-10T09:45:00+01:00" },
  { start: "2026-06-10T09:45:00+01:00", end: "2026-06-10T10:30:00+01:00" },
  { start: "2026-06-10T10:30:00+01:00", end: "2026-06-10T11:15:00+01:00" },
  { start: "2026-06-10T11:15:00+01:00", end: "2026-06-10T12:00:00+01:00" },
];

export const mockBusinessDays: BusinessDay[] = [0, 1, 2, 3, 4, 5, 6].map(
  (weekday) => ({
    id: `bd-${weekday}`,
    shop_id: mockShop.id,
    weekday,
    is_active: weekday !== 0,
    open_time: "09:00",
    close_time: "18:00",
  }),
);

export const mockBookingCode = "BK-TEST-1234";
export const mockPaymentReference = "ref_test_123";

export const mockInitiateResult: InitiateResult = {
  booking: {
    id: "bk-1",
    code: mockBookingCode,
    shop_id: mockShop.id,
    service_id: "svc-1",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    status: "pending_payment",
    starts_at: "2026-06-10T09:00:00+01:00",
    ends_at: "2026-06-10T09:45:00+01:00",
    payment_reference: mockPaymentReference,
  },
  payment: {
    id: "pay-1",
    booking_id: "bk-1",
    reference: mockPaymentReference,
    amount_kobo: 500000,
    status: "pending",
    channel: "card",
  },
  authorization_url: "https://checkout.paystack.com/test-checkout",
  access_code: "access_test",
};

export const mockBookingItem: BookingListItem = {
  ...mockInitiateResult.booking,
  status: "confirmed",
  service_name: "Skin Fade",
  amount_kobo: 500000,
  payment_status: "success",
};

export const mockBookingsList: BookingListItem[] = [
  mockBookingItem,
  {
    ...mockBookingItem,
    id: "bk-2",
    code: "BK-TEST-5678",
    customer_name: "Ada Obi",
    customer_email: "ada@example.com",
    status: "pending_payment",
    payment_status: "pending",
  },
];

export const mockAnalytics: AnalyticsSummary = {
  total_revenue_kobo: 4500000,
  total_bookings: 42,
  confirmed_bookings: 31,
  cancelled_bookings: 5,
  expired_bookings: 2,
  revenue_series: Array.from({ length: 14 }, (_, i) => ({
    date: `2026-05-${String(i + 1).padStart(2, "0")}`,
    revenue_kobo: 200000 + i * 25000,
    bookings: 2 + (i % 4),
  })),
  top_services: [
    { service_id: "svc-1", name: "Skin Fade", bookings: 20, revenue_kobo: 10000000 },
    { service_id: "svc-2", name: "Beard Trim", bookings: 12, revenue_kobo: 3000000 },
  ],
};

export const mockSession: AuthResult = {
  user: {
    id: mockShop.owner_id,
    email: "sam@example.com",
    phone: "+2348012345678",
    role: "owner",
    email_verified: false,
  },
  tokens: {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    refresh_expires_at: "2026-07-10T09:00:00Z",
  },
};
