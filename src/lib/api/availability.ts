import { api } from "@/lib/api/client";
import type { AvailableSlot } from "@/types";

export interface AvailabilityParams {
  /** Shop slug (GET /shops/:id/availability resolves by slug). */
  shopSlug: string;
  date: string; // YYYY-MM-DD
}

export const availabilityApi = {
  /** Returns the list of bookable slots for a date (empty if closed/blocked). */
  get: ({ shopSlug, date }: AvailabilityParams) => {
    const qs = new URLSearchParams({ date });
    return api.get<AvailableSlot[]>(
      `/shops/${encodeURIComponent(shopSlug)}/availability?${qs.toString()}`,
      { auth: false },
    );
  },
};
