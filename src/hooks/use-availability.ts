"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { availabilityApi } from "@/lib/api/availability";
import { queryKeys } from "@/lib/query/keys";

export function useAvailability(params: {
  shopSlug: string | undefined;
  date: string | undefined;
  enabled?: boolean;
}) {
  const { shopSlug, date, enabled = true } = params;
  return useQuery({
    queryKey: queryKeys.availability.byDate(shopSlug ?? "", date ?? ""),
    queryFn: () =>
      availabilityApi.get({ shopSlug: shopSlug as string, date: date as string }),
    enabled: enabled && !!shopSlug && !!date,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
