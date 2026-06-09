"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  shopsApi,
  type CreateShopPayload,
  type PatchBusinessDayPayload,
  type SchedulePayload,
  type UpdateShopPayload,
} from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/hooks/use-auth";

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShopPayload) => shopsApi.create(payload),
    onSuccess: (shop) => {
      qc.setQueryData(queryKeys.shops.detail(shop.slug), shop);
    },
    onError: (e) => toast.error(errorMessage(e, "Could not create shop")),
  });
}

export function useUpdateShop(shopId: string, slug?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateShopPayload) => shopsApi.update(shopId, payload),
    onSuccess: (shop) => {
      qc.setQueryData(queryKeys.shops.detail(shop.slug), shop);
      if (slug && slug !== shop.slug) {
        qc.invalidateQueries({ queryKey: queryKeys.shops.detail(slug) });
      }
      toast.success("Changes saved");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not save changes")),
  });
}

export function useBusinessDays(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shops.businessDays(shopId ?? ""),
    queryFn: () => shopsApi.listBusinessDays(shopId as string),
    enabled: !!shopId,
  });
}

export function useUpsertSchedule(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchedulePayload) =>
      shopsApi.upsertSchedule(shopId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shops.businessDays(shopId) });
      toast.success("Business hours updated");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update hours")),
  });
}

export function usePatchBusinessDay(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dayId, input }: { dayId: string; input: PatchBusinessDayPayload }) =>
      shopsApi.patchBusinessDay(shopId, dayId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shops.businessDays(shopId) });
      toast.success("Day updated");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update day")),
  });
}

export function useBlockedDates(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shops.blockedDates(shopId ?? ""),
    queryFn: () => shopsApi.listBlockedDates(shopId as string),
    enabled: !!shopId,
  });
}

export function useAddBlockedDate(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { date: string; reason?: string }) =>
      shopsApi.addBlockedDate(shopId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shops.blockedDates(shopId) });
      toast.success("Date blocked");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not block date")),
  });
}

export function useDeleteBlockedDate(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shopsApi.deleteBlockedDate(shopId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shops.blockedDates(shopId) });
      toast.success("Date unblocked");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not unblock date")),
  });
}
