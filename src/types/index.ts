/**
 * Domain types for the Bookly backend (barber-booking-backend).
 *
 * The backend handler payloads were not available at build time, so these
 * shapes are inferred from `router.go`, the product spec, and conventional
 * Go/JSON API design. They are centralised here so they can be adjusted in a
 * single place if the live API differs. See README "API assumptions".
 */

export type Role = "owner" | "customer";

export type UUID = string;
/** ISO-8601 timestamp, e.g. "2026-06-07T10:00:00Z". */
export type ISODateTime = string;
/** Calendar date "YYYY-MM-DD". */
export type ISODate = string;
/** Clock time "HH:mm" (24h). */
export type ClockTime = string;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface User {
  id: UUID;
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt?: ISODateTime;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthSession extends AuthTokens {
  user: User;
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export interface Shop {
  id: UUID;
  ownerId?: UUID;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  description?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  // Booking configuration
  capacity: number;
  bookingWindowDays: number;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  cancellationHours: number;
  // Payment / settings
  paystackConnected?: boolean;
  createdAt?: ISODateTime;
  updatedAt?: ISODateTime;
}

export interface BusinessDay {
  id: UUID;
  shopId?: UUID;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  isOpen: boolean;
  openTime: ClockTime;
  closeTime: ClockTime;
}

export interface BlockedDate {
  id: UUID;
  shopId?: UUID;
  date: ISODate;
  reason?: string;
}

export interface Service {
  id: UUID;
  shopId: UUID;
  name: string;
  description?: string;
  durationMinutes: number;
  priceKobo: number;
  isActive: boolean;
  createdAt?: ISODateTime;
  updatedAt?: ISODateTime;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export interface Slot {
  /** Clock time the slot starts, "HH:mm". */
  startTime: ClockTime;
  /** Clock time the slot ends, "HH:mm". */
  endTime?: ClockTime;
  /** Remaining capacity for this slot. */
  available: number;
  /** Total capacity configured for the slot. */
  capacity?: number;
}

export interface AvailabilityResponse {
  date: ISODate;
  slots: Slot[];
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: UUID;
  code: string;
  shopId: UUID;
  serviceId: UUID;
  service?: Pick<Service, "id" | "name" | "durationMinutes" | "priceKobo">;
  date: ISODate;
  startTime: ClockTime;
  endTime?: ClockTime;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountKobo: number;
  customer: CustomerDetails;
  notes?: string;
  createdAt?: ISODateTime;
}

export interface InitiateBookingRequest {
  shopId: UUID;
  serviceId: UUID;
  date: ISODate;
  startTime: ClockTime;
  customer: CustomerDetails;
  notes?: string;
}

export interface InitiateBookingResponse {
  booking: Booking;
  /** Some backends return the Paystack URL directly from initiate. */
  payment?: PaymentInitResponse;
}

// ---------------------------------------------------------------------------
// Payments (Paystack)
// ---------------------------------------------------------------------------

export interface PaymentInitRequest {
  bookingCode?: string;
  bookingId?: UUID;
  email?: string;
  callbackUrl?: string;
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface AnalyticsSummary {
  totalRevenueKobo: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  upcomingBookings: number;
  occupancyRate: number; // 0..1
  revenueSeries: { date: ISODate; revenueKobo: number; bookings: number }[];
  topServices: { serviceId: UUID; name: string; bookings: number; revenueKobo: number }[];
}

// ---------------------------------------------------------------------------
// API error envelope
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  error?: string;
  message?: string;
  code?: string;
  details?: Record<string, string[]>;
}
