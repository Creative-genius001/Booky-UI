"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { availabilityApi } from "@/lib/api/availability";
import { queryKeys } from "@/lib/query/keys";

export function useAvailability(params: {
  shopId: string | undefined;
  date: string | undefined;
  serviceId?: string;
  enabled?: boolean;
}) {
  const { shopId, date, serviceId, enabled = true } = params;
  return useQuery({
    queryKey: queryKeys.availability.byDate(shopId ?? "", date ?? "", serviceId),
    queryFn: () =>
      availabilityApi.get({
        shopId: shopId as string,
        date: date as string,
        serviceId,
      }),
    enabled: enabled && !!shopId && !!date,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
