"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tracks the owner's active shop id. router.go exposes no "list my shops"
 * endpoint, so we remember the shop created/managed by this owner locally and
 * fetch its details via GET /shops/:id. Adjust if the API gains /shops/me.
 */
interface ShopState {
  activeShopId: string | null;
  onboardingComplete: boolean;
  setActiveShop: (id: string) => void;
  setOnboardingComplete: (done: boolean) => void;
  clear: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      activeShopId: null,
      onboardingComplete: false,
      setActiveShop: (id) => set({ activeShopId: id }),
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      clear: () => set({ activeShopId: null, onboardingComplete: false }),
    }),
    { name: "bookly.shop" },
  ),
);
