import type {
  AnalyticsSummary,
  AuthSession,
  Booking,
  BusinessDay,
  Service,
  Shop,
  Slot,
} from "@/types";

/** Shared mock data used by both MSW (unit/component) and Playwright (e2e). */

export const mockShop: Shop = {
  id: "shop_1",
  ownerId: "user_1",
  name: "Kingsway Cuts",
  slug: "demo-shop",
  phone: "+234 800 000 0000",
  address: "12 Marina Rd, Lagos",
  description: "A premium grooming experience in the heart of the city.",
  logoUrl: null,
  coverImageUrl: null,
  capacity: 3,
  bookingWindowDays: 14,
  slotIntervalMinutes: 30,
  bufferMinutes: 0,
  cancellationHours: 2,
  paystackConnected: true,
};

export const mockServices: Service[] = [
  {
    id: "svc_1",
    shopId: "shop_1",
    name: "Skin Fade",
    description: "Sharp, clean fade with a razor finish.",
    durationMinutes: 45,
    priceKobo: 500000,
    isActive: true,
  },
  {
    id: "svc_2",
    shopId: "shop_1",
    name: "Beard Trim",
    description: "Shape-up and hot towel finish.",
    durationMinutes: 20,
    priceKobo: 250000,
    isActive: true,
  },
  {
    id: "svc_3",
    shopId: "shop_1",
    name: "Kids Cut",
    description: "Quick and friendly cut for under-12s.",
    durationMinutes: 30,
    priceKobo: 300000,
    isActive: false,
  },
];

export const mockSlots: Slot[] = [
  { startTime: "09:00", endTime: "09:30", available: 3, capacity: 3 },
  { startTime: "09:30", endTime: "10:00", available: 2, capacity: 3 },
  { startTime: "10:00", endTime: "10:30", available: 0, capacity: 3 },
  { startTime: "10:30", endTime: "11:00", available: 1, capacity: 3 },
  { startTime: "11:00", endTime: "11:30", available: 3, capacity: 3 },
];

export const mockBusinessDays: BusinessDay[] = [1, 2, 3, 4, 5, 6, 0].map(
  (weekday, i) => ({
    id: `bd_${i}`,
    shopId: "shop_1",
    weekday,
    isOpen: weekday !== 0,
    openTime: "09:00",
    closeTime: "18:00",
  }),
);

export const mockBookingCode = "BK-TEST-1234";

export const mockBooking: Booking = {
  id: "bk_1",
  code: mockBookingCode,
  shopId: "shop_1",
  serviceId: "svc_1",
  service: {
    id: "svc_1",
    name: "Skin Fade",
    durationMinutes: 45,
    priceKobo: 500000,
  },
  date: "2026-06-10",
  startTime: "09:30",
  endTime: "10:15",
  status: "confirmed",
  paymentStatus: "paid",
  amountKobo: 500000,
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+2348000000000",
  },
  notes: "Please prepare a low fade",
  createdAt: "2026-06-07T10:00:00Z",
};

export const mockBookingsList: Booking[] = [
  mockBooking,
  {
    ...mockBooking,
    id: "bk_2",
    code: "BK-TEST-5678",
    startTime: "11:00",
    customer: { name: "Ada Obi", email: "ada@example.com", phone: "+2348111111111" },
    notes: undefined,
  },
];

export const mockSession: AuthSession = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresIn: 3600,
  user: {
    id: "user_1",
    fullName: "Sam Barber",
    email: "sam@example.com",
    role: "owner",
    emailVerified: true,
  },
};

export const mockAnalytics: AnalyticsSummary = {
  totalRevenueKobo: 4500000,
  totalBookings: 42,
  completedBookings: 31,
  cancelledBookings: 5,
  noShowBookings: 2,
  upcomingBookings: 4,
  occupancyRate: 0.72,
  revenueSeries: Array.from({ length: 14 }, (_, i) => ({
    date: `2026-05-${String(i + 1).padStart(2, "0")}`,
    revenueKobo: 200000 + i * 25000,
    bookings: 2 + (i % 4),
  })),
  topServices: [
    { serviceId: "svc_1", name: "Skin Fade", bookings: 20, revenueKobo: 10000000 },
    { serviceId: "svc_2", name: "Beard Trim", bookings: 12, revenueKobo: 3000000 },
  ],
};
