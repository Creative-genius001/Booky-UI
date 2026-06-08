"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";
import { queryKeys } from "@/lib/query/keys";

export function useAnalytics(
  shopId: string | undefined,
  range: "7d" | "30d" | "90d" = "30d",
) {
  return useQuery({
    queryKey: queryKeys.shops.analytics(shopId ?? "", range),
    queryFn: () => analyticsApi.summary(shopId as string, range),
    enabled: !!shopId,
  });
}
