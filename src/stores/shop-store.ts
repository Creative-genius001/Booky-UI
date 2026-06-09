"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tracks the owner's active shop. The backend exposes no "list my shops"
 * endpoint and GET /shops/:id resolves by SLUG, while owner mutations are keyed
 * by the shop UUID — so we remember both the id (for mutations) and the slug
 * (for public fetch + the booking link) after the shop is created.
 */
interface ShopState {
  activeShopId: string | null;
  activeShopSlug: string | null;
  onboardingComplete: boolean;
  setActiveShop: (id: string, slug: string) => void;
  setOnboardingComplete: (done: boolean) => void;
  clear: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      activeShopId: null,
      activeShopSlug: null,
      onboardingComplete: false,
      setActiveShop: (id, slug) =>
        set({ activeShopId: id, activeShopSlug: slug }),
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      clear: () =>
        set({
          activeShopId: null,
          activeShopSlug: null,
          onboardingComplete: false,
        }),
    }),
    { name: "bookly.shop" },
  ),
);
