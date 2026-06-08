import { api } from "@/lib/api/client";
import type {
  Booking,
  BookingStatus,
  InitiateBookingRequest,
  InitiateBookingResponse,
} from "@/types";

export interface ListBookingsParams {
  shopId: string;
  status?: BookingStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface ListBookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

export const bookingsApi = {
  /** Router: POST /bookings/initiate (public, no account). */
  initiate: (payload: InitiateBookingRequest) =>
    api.post<InitiateBookingResponse>("/bookings/initiate", payload, {
      auth: false,
    }),

  /** Public lookup by booking code (success screen / status polling). */
  getByCode: (code: string) =>
    api.get<Booking>(`/bookings/${encodeURIComponent(code)}`, { auth: false }),

  // ---- Owner dashboard (guarded by auth on the backend) ----
  list: ({ shopId, status = "all", page = 1, pageSize = 20 }: ListBookingsParams) => {
    const qs = new URLSearchParams({
      shopId,
      status,
      page: String(page),
      pageSize: String(pageSize),
    });
    return api.get<ListBookingsResponse>(`/bookings?${qs.toString()}`);
  },

  updateStatus: (bookingId: string, status: BookingStatus) =>
    api.patch<Booking>(`/bookings/${bookingId}`, { status }),

  cancel: (bookingId: string) =>
    api.post<Booking>(`/bookings/${bookingId}/cancel`),
};
