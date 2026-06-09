"use client";

import { useShop } from "@/hooks/use-shop";
import { useShopStore } from "@/stores/shop-store";

/**
 * Resolves the owner's active shop. We fetch by slug (the only public read
 * endpoint) but keep the UUID around for owner mutations.
 */
export function useActiveShop() {
  const activeShopId = useShopStore((s) => s.activeShopId);
  const activeShopSlug = useShopStore((s) => s.activeShopSlug);
  const query = useShop(activeShopSlug ?? undefined);
  return {
    ...query,
    shopId: activeShopId,
    shopSlug: activeShopSlug,
    shop: query.data,
  };
}
