"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops";
import { queryKeys } from "@/lib/query/keys";
import { useShopStore } from "@/stores/shop-store";

/**
 * Ensures the owner's active shop is known. If nothing is persisted locally
 * (e.g. a returning owner on a new device), it fetches GET /shops/mine and
 * adopts the first shop. Reports when the owner has no shop yet so the caller
 * can route to onboarding.
 */
export function useEnsureShop() {
  const activeShopSlug = useShopStore((s) => s.activeShopSlug);
  const setActiveShop = useShopStore((s) => s.setActiveShop);

  const mine = useQuery({
    queryKey: queryKeys.shops.mine,
    queryFn: () => shopsApi.mine(),
    enabled: !activeShopSlug,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!activeShopSlug && mine.data && mine.data.length > 0) {
      const shop = mine.data[0];
      setActiveShop(shop.id, shop.slug);
    }
  }, [activeShopSlug, mine.data, setActiveShop]);

  const resolving = !activeShopSlug && (mine.isLoading || mine.isFetching);
  const hasShop = !!activeShopSlug || (mine.data?.length ?? 0) > 0;
  const isEmpty = !activeShopSlug && mine.isSuccess && mine.data.length === 0;

  return { resolving, hasShop, isEmpty };
}
