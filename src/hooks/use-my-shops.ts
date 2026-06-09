"use client";

import { useQuery } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

/** The authenticated owner's shops (multi-shop aware). */
export function useMyShops() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.shops.mine,
    queryFn: () => shopsApi.mine(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
