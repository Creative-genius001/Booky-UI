"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { shopsApi, type DiscoverParams } from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";

/** Public shop discovery (distance/search/pagination). */
export function useDiscovery(params: DiscoverParams, enabled = true) {
  const key = JSON.stringify(params);
  return useQuery({
    queryKey: queryKeys.shops.discover(key),
    queryFn: () => shopsApi.discover(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
