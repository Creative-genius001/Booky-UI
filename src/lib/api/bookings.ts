import { api } from "@/lib/api/client";
import type {
  BookingListItem,
  BookingListResult,
  InitiateResult,
} from "@/types";

export interface InitiateBookingPayload {
  service_id: string;
  customer_name: string;
  customer_email: string;
  /** RFC-3339 start time taken from the selected availability slot. */
  start_time: string;
}

export interface ListBookingsParams {
  shopId: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const bookingsApi = {
  /**
   * POST /bookings/initiate (public, no account). Creates a pending booking +
   * payment and returns the Paystack authorization URL to redirect to.
   */
  initiate: (payload: InitiateBookingPayload) =>
    api.post<InitiateResult>("/bookings/initiate", payload, { auth: false }),

  /** GET /bookings/:code (public) — booking status for the success page. */
  getByCode: (code: string) =>
    api.get<BookingListItem>(`/bookings/${encodeURIComponent(code)}`, {
      auth: false,
    }),

  /** POST /bookings/cancel (public, by code). */
  cancel: (code: string) =>
    api.post<BookingListItem>("/bookings/cancel", { code }, { auth: false }),

  /** POST /bookings/reschedule (public, by code) — start_time is RFC-3339. */
  reschedule: (code: string, start_time: string) =>
    api.post<BookingListItem>(
      "/bookings/reschedule",
      { code, start_time },
      { auth: false },
    ),

  /** GET /shops/:id/bookings — owner-scoped, paginated + searchable. */
  list: ({ shopId, status, search, page = 1, pageSize = 20 }: ListBookingsParams) => {
    const qs = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (status && status !== "all") qs.set("status", status);
    if (search) qs.set("search", search);
    return api.get<BookingListResult>(
      `/shops/${shopId}/bookings?${qs.toString()}`,
    );
  },
};
