export type Role = "customer" | "owner";

export type UUID = string;
/** RFC-3339 timestamp, e.g. "2026-06-07T10:00:00Z". */
export type ISODateTime = string;
/** Calendar date "YYYY-MM-DD". */
export type ISODate = string;
/** Clock time "HH:mm" (24h). */
export type ClockTime = string;

// ---------------------------------------------------------------------------
// Auth — models.UserResponse + utils.TokenPair (auth.AuthResult)
// ---------------------------------------------------------------------------

export interface User {
  id: UUID;
  email: string;
  phone: string;
  role: Role;
  email_verified: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  refresh_expires_at?: ISODateTime;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

// ---------------------------------------------------------------------------
// Shop — models.Shop
// ---------------------------------------------------------------------------

export interface Shop {
  id: UUID;
  owner_id: UUID;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  logo_url?: string;
  cover_image_url?: string;
  timezone: string;
  is_active: boolean;
  /** Length of a single appointment, in minutes (shop default). */
  barbing_duration: number;
  /** How many customers can be served in the same slot. */
  capacity_per_slot: number;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

/** Public discovery card — shops.ShopCard. */
export interface ShopCard {
  id: UUID;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo_url: string;
  cover_image_url: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number;
}

export interface DiscoverResult {
  shops: ShopCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface BusinessDay {
  id: UUID;
  shop_id: UUID;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  is_active: boolean;
  open_time: ClockTime;
  close_time: ClockTime;
}

export interface BlockedDate {
  id: UUID;
  shop_id: UUID;
  /** Backend returns an RFC-3339 timestamp for the blocked day. */
  date: ISODateTime;
  reason: string;
}

export interface Service {
  id: UUID;
  shop_id: UUID;
  name: string;
  description: string;
  /** Price in Naira (whole units). Converted to kobo server-side at payment. */
  price: number;
  duration_in_minutes: number;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

// ---------------------------------------------------------------------------
// Availability — models.AvailableSlot
// ---------------------------------------------------------------------------

export interface AvailableSlot {
  /** RFC-3339 start of the bookable slot — sent verbatim as `start_time`. */
  start: ISODateTime;
  /** RFC-3339 end of the slot. */
  end: ISODateTime;
}

// ---------------------------------------------------------------------------
// Bookings & Payments — bookings.InitiateResult / BookingResponse, models.Payment
// ---------------------------------------------------------------------------

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "expired";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type PaymentChannel = "card" | "bank_transfer";

export interface BookingResponse {
  id: UUID;
  code: string;
  shop_id: UUID;
  service_id: UUID;
  customer_name: string;
  customer_email: string;
  status: BookingStatus;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  payment_reference: string;
}

export interface Payment {
  id: UUID;
  booking_id: UUID;
  reference: string;
  amount_kobo: number;
  status: PaymentStatus;
  channel: PaymentChannel;
  paid_at?: ISODateTime;
}

export interface InitiateResult {
  booking: BookingResponse;
  payment: Payment;
  authorization_url: string;
  access_code: string;
}

/** bookings.BookingListItem — booking enriched with service + payment info. */
export interface BookingListItem extends BookingResponse {
  service_name: string;
  amount_kobo: number;
  payment_status: PaymentStatus | "";
}

export interface BookingListResult {
  bookings: BookingListItem[];
  total: number;
  page: number;
  page_size: number;
}

// ---------------------------------------------------------------------------
// Analytics — bookings.AnalyticsSummary
// ---------------------------------------------------------------------------

export interface RevenuePoint {
  date: ISODate;
  revenue_kobo: number;
  bookings: number;
}

export interface TopService {
  service_id: UUID;
  name: string;
  bookings: number;
  revenue_kobo: number;
}

export interface AnalyticsSummary {
  total_revenue_kobo: number;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  expired_bookings: number;
  revenue_series: RevenuePoint[];
  top_services: TopService[];
}

// ---------------------------------------------------------------------------
// API error envelope — httpx.Error => { "error": string, "code": number }
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  error?: string;
  code?: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Payouts — payouts module
// ---------------------------------------------------------------------------

export interface Bank {
  name: string;
  code: string;
  slug?: string;
}

export interface ShopBankAccount {
  id: UUID;
  shop_id: UUID;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface WalletSummary {
  balance_kobo: number;
  currency: string;
}

export type WalletEntryType = "credit" | "debit";

export interface WalletEntry {
  id: UUID;
  shop_id: UUID;
  type: WalletEntryType;
  amount_kobo: number;
  reason: string;
  booking_id?: UUID | null;
  withdrawal_id?: UUID | null;
  created_at?: ISODateTime;
}

export interface WalletEntriesResult {
  entries: WalletEntry[];
  total: number;
  page: number;
  page_size: number;
}

export type WithdrawalStatus = "pending" | "processing" | "paid" | "failed";

export interface WithdrawalRequest {
  id: UUID;
  shop_id: UUID;
  amount_kobo: number;
  status: WithdrawalStatus;
  reference: string;
  failure_reason?: string;
  processed_at?: ISODateTime | null;
  created_at?: ISODateTime;
}

export interface WithdrawalsResult {
  withdrawals: WithdrawalRequest[];
  total: number;
}
