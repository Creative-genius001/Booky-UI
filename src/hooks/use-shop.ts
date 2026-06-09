"use client";

import { useQuery } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";

/** Public shop lookup by slug — used by the customer flow and the dashboard. */
export function useShop(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shops.detail(slug ?? ""),
    queryFn: () => shopsApi.getBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60_000, // shop details rarely change within a session
  });
}
