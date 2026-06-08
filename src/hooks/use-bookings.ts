"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingsApi, type ListBookingsParams } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/hooks/use-auth";
import type { BookingStatus, InitiateBookingRequest } from "@/types";

export function useInitiateBooking() {
  return useMutation({
    mutationFn: (payload: InitiateBookingRequest) =>
      bookingsApi.initiate(payload),
    onError: (e) =>
      toast.error(errorMessage(e, "We couldn't start your booking")),
  });
}

export function useBookingByCode(code: string | undefined, refetch = false) {
  return useQuery({
    queryKey: queryKeys.bookings.byCode(code ?? ""),
    queryFn: () => bookingsApi.getByCode(code as string),
    enabled: !!code,
    refetchInterval: refetch ? 4000 : false,
  });
}

export function useShopBookings(params: ListBookingsParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(
      params.shopId,
      params.status ?? "all",
      params.page ?? 1,
    ),
    queryFn: () => bookingsApi.list(params),
    enabled: !!params.shopId,
  });
}

export function useUpdateBookingStatus(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: (_b, { status }) => {
      qc.invalidateQueries({ queryKey: ["bookings", shopId] });
      toast.success(`Booking marked ${status.replace("_", " ")}`);
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update booking")),
  });
}
