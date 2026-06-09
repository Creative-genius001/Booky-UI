"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bookingsApi,
  type InitiateBookingPayload,
  type ListBookingsParams,
} from "@/lib/api/bookings";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/hooks/use-auth";
import type { BookingListItem } from "@/types";

export function useInitiateBooking() {
  return useMutation({
    mutationFn: (payload: InitiateBookingPayload) =>
      bookingsApi.initiate(payload),
    onError: (e) =>
      toast.error(errorMessage(e, "We couldn't start your booking")),
  });
}

/** Polls a booking by code until payment reaches a terminal state. */
export function useBookingByCode(code: string | undefined, poll = false) {
  return useQuery({
    queryKey: queryKeys.bookings.byCode(code ?? ""),
    queryFn: () => bookingsApi.getByCode(code as string),
    enabled: !!code,
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.payment_status;
      // Stop polling once payment settles.
      if (status === "success" || status === "failed" || status === "refunded") {
        return false;
      }
      return 3000;
    },
  });
}

function onLifecycleSuccess(
  qc: ReturnType<typeof useQueryClient>,
  item: BookingListItem,
) {
  qc.setQueryData(queryKeys.bookings.byCode(item.code), item);
  // Refresh any owner list/analytics views.
  qc.invalidateQueries({ queryKey: ["bookings"] });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => bookingsApi.cancel(code),
    onSuccess: (item) => {
      onLifecycleSuccess(qc, item);
      toast.success("Booking cancelled");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not cancel this booking")),
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, start }: { code: string; start: string }) =>
      bookingsApi.reschedule(code, start),
    onSuccess: (item) => {
      onLifecycleSuccess(qc, item);
      toast.success("Booking rescheduled");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not reschedule this booking")),
  });
}

export function useShopBookings(params: ListBookingsParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(
      params.shopId,
      params.status ?? "all",
      params.search ?? "",
      params.page ?? 1,
    ),
    queryFn: () => bookingsApi.list(params),
    enabled: !!params.shopId,
    placeholderData: keepPreviousData,
  });
}
