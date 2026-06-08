"use client";

import { useQuery } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";

/** Public shop lookup by id or slug — used by the customer booking flow. */
export function useShop(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shops.detail(idOrSlug ?? ""),
    queryFn: () => shopsApi.get(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 60_000,
  });
}
