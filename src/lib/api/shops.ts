import { api } from "@/lib/api/client";
import type { BlockedDate, BusinessDay, Shop } from "@/types";

export interface CreateShopPayload {
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export type UpdateShopPayload = Partial<
  CreateShopPayload & {
    capacity: number;
    bookingWindowDays: number;
    slotIntervalMinutes: number;
    bufferMinutes: number;
    cancellationHours: number;
  }
>;

export interface BusinessDayInput {
  weekday: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const shopsApi = {
  create: (payload: CreateShopPayload) => api.post<Shop>("/shops", payload),

  /**
   * Public shop lookup. The router exposes GET /shops/:id; the customer flow
   * uses a slug, so we pass it through the same endpoint (the backend resolves
   * either an id or slug).
   */
  get: (idOrSlug: string) =>
    api.get<Shop>(`/shops/${encodeURIComponent(idOrSlug)}`, { auth: false }),

  update: (id: string, payload: UpdateShopPayload) =>
    api.patch<Shop>(`/shops/${id}`, payload),

  // Business days
  listBusinessDays: (shopId: string) =>
    api.get<BusinessDay[]>(`/shops/${shopId}/business-days`),
  upsertBusinessDays: (shopId: string, days: BusinessDayInput[]) =>
    api.post<BusinessDay[]>(`/shops/${shopId}/business-days`, { days }),
  patchBusinessDay: (shopId: string, dayId: string, payload: Partial<BusinessDayInput>) =>
    api.patch<BusinessDay>(`/shops/${shopId}/business-days/${dayId}`, payload),

  // Blocked dates
  listBlockedDates: (shopId: string) =>
    api.get<BlockedDate[]>(`/shops/${shopId}/blocked-dates`),
  addBlockedDate: (shopId: string, payload: { date: string; reason?: string }) =>
    api.post<BlockedDate>(`/shops/${shopId}/blocked-dates`, payload),
  deleteBlockedDate: (shopId: string, blockedDateId: string) =>
    api.del<void>(`/shops/${shopId}/blocked-dates/${blockedDateId}`),
};
