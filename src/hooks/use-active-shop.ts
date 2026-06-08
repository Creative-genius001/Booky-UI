"use client";

import { useShop } from "@/hooks/use-shop";
import { useShopStore } from "@/stores/shop-store";

/** Resolves the owner's active shop (id from shop-store + full details). */
export function useActiveShop() {
  const activeShopId = useShopStore((s) => s.activeShopId);
  const query = useShop(activeShopId ?? undefined);
  return { ...query, shopId: activeShopId, shop: query.data };
}
