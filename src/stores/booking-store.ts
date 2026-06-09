"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service, Shop } from "@/types";

export type BookingStep = "service" | "date" | "time" | "details" | "payment";

export const BOOKING_STEPS: BookingStep[] = [
  "service",
  "date",
  "time",
  "details",
  "payment",
];

export interface CustomerDetails {
  name: string;
  email: string;
}

interface BookingState {
  shopSlug: string | null;
  shop: Shop | null;
  service: Service | null;
  date: string | null; // YYYY-MM-DD (the day being browsed)
  /** RFC-3339 start time of the chosen slot (sent as start_time). */
  startTime: string | null;
  customer: CustomerDetails;

  setShop: (slug: string, shop: Shop) => void;
  selectService: (service: Service) => void;
  selectDate: (date: string) => void;
  selectTime: (startISO: string) => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  reset: (slug?: string) => void;
  /** Highest step the user has enough data to view. */
  furthestStep: () => BookingStep;
}

const emptyCustomer: CustomerDetails = { name: "", email: "" };

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      shopSlug: null,
      shop: null,
      service: null,
      date: null,
      startTime: null,
      customer: emptyCustomer,

      setShop: (slug, shop) => {
        const current = get();
        if (current.shopSlug && current.shopSlug !== slug) {
          set({
            shopSlug: slug,
            shop,
            service: null,
            date: null,
            startTime: null,
            customer: emptyCustomer,
          });
        } else {
          set({ shopSlug: slug, shop });
        }
      },
      selectService: (service) => set({ service, date: null, startTime: null }),
      selectDate: (date) => set({ date, startTime: null }),
      selectTime: (startTime) => set({ startTime }),
      setCustomer: (customer) =>
        set((s) => ({ customer: { ...s.customer, ...customer } })),
      reset: (slug) =>
        set({
          shopSlug: slug ?? null,
          service: null,
          date: null,
          startTime: null,
          customer: emptyCustomer,
        }),
      furthestStep: () => {
        const s = get();
        if (!s.service) return "service";
        if (!s.date) return "date";
        if (!s.startTime) return "time";
        const c = s.customer;
        if (!c.name || !c.email) return "details";
        return "payment";
      },
    }),
    {
      name: "bookly.booking",
      partialize: (s) => ({
        shopSlug: s.shopSlug,
        service: s.service,
        date: s.date,
        startTime: s.startTime,
        customer: s.customer,
      }),
    },
  ),
);
