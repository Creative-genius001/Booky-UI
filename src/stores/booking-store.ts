"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerDetails, Service, Shop } from "@/types";

export type BookingStep = "service" | "date" | "time" | "details" | "payment";

export const BOOKING_STEPS: BookingStep[] = [
  "service",
  "date",
  "time",
  "details",
  "payment",
];

interface BookingState {
  shopSlug: string | null;
  shop: Shop | null;
  service: Service | null;
  date: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:mm
  customer: CustomerDetails;
  notes: string;

  setShop: (slug: string, shop: Shop) => void;
  selectService: (service: Service) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  setNotes: (notes: string) => void;
  reset: (slug?: string) => void;
  /** Highest step the user has enough data to view. */
  furthestStep: () => BookingStep;
}

const emptyCustomer: CustomerDetails = { name: "", email: "", phone: "" };

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      shopSlug: null,
      shop: null,
      service: null,
      date: null,
      startTime: null,
      customer: emptyCustomer,
      notes: "",

      setShop: (slug, shop) => {
        const current = get();
        // Reset selections when switching to a different shop.
        if (current.shopSlug && current.shopSlug !== slug) {
          set({
            shopSlug: slug,
            shop,
            service: null,
            date: null,
            startTime: null,
            customer: emptyCustomer,
            notes: "",
          });
        } else {
          set({ shopSlug: slug, shop });
        }
      },
      selectService: (service) =>
        set({ service, date: null, startTime: null }),
      selectDate: (date) => set({ date, startTime: null }),
      selectTime: (startTime) => set({ startTime }),
      setCustomer: (customer) =>
        set((s) => ({ customer: { ...s.customer, ...customer } })),
      setNotes: (notes) => set({ notes }),
      reset: (slug) =>
        set({
          shopSlug: slug ?? null,
          service: null,
          date: null,
          startTime: null,
          customer: emptyCustomer,
          notes: "",
        }),
      furthestStep: () => {
        const s = get();
        if (!s.service) return "service";
        if (!s.date) return "date";
        if (!s.startTime) return "time";
        const c = s.customer;
        if (!c.name || !c.email || !c.phone) return "details";
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
        notes: s.notes,
      }),
    },
  ),
);
