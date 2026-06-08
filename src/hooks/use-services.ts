"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { servicesApi, type ServiceInput } from "@/lib/api/services";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/hooks/use-auth";
import type { Service } from "@/types";

export function useServices(
  shopId: string | undefined,
  opts: { activeOnly?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.services.list(shopId ?? ""),
    queryFn: () => servicesApi.list(shopId as string),
    enabled: !!shopId,
    select: (data) =>
      opts.activeOnly ? data.filter((s) => s.isActive) : data,
  });
}

export function useService(serviceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.services.detail(serviceId ?? ""),
    queryFn: () => servicesApi.get(serviceId as string),
    enabled: !!serviceId,
  });
}

export function useCreateService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceInput) => servicesApi.create(shopId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services.list(shopId) });
      toast.success("Service created");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not create service")),
  });
}

export function useUpdateService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ServiceInput> }) =>
      servicesApi.update(shopId, id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: queryKeys.services.list(shopId) });
      const prev = qc.getQueryData<Service[]>(queryKeys.services.list(shopId));
      if (prev) {
        qc.setQueryData<Service[]>(
          queryKeys.services.list(shopId),
          prev.map((s) => (s.id === id ? { ...s, ...input } : s)),
        );
      }
      return { prev };
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.services.list(shopId), ctx.prev);
      toast.error(errorMessage(e, "Could not update service"));
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.services.list(shopId) }),
  });
}

export function useDeleteService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.services.list(shopId) });
      const prev = qc.getQueryData<Service[]>(queryKeys.services.list(shopId));
      if (prev) {
        qc.setQueryData<Service[]>(
          queryKeys.services.list(shopId),
          prev.filter((s) => s.id !== id),
        );
      }
      return { prev };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.services.list(shopId), ctx.prev);
      toast.error(errorMessage(e, "Could not delete service"));
    },
    onSuccess: () => toast.success("Service deleted"),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.services.list(shopId) }),
  });
}
