import { api } from "@/lib/api/client";
import type {
  BlockedDate,
  BusinessDay,
  DiscoverResult,
  Shop,
} from "@/types";

export interface CreateShopPayload {
  name: string;
  slug?: string;
  email: string;
  phone: string;
  timezone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  cover_image_url?: string;
  barbing_duration?: number;
  capacity_per_slot?: number;
}

export interface UpdateShopPayload {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  cover_image_url?: string;
  is_active?: boolean;
  barbing_duration?: number;
  capacity_per_slot?: number;
}

export interface DiscoverParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** POST /shops/:id/business-days — a single schedule applied across active days. */
export interface SchedulePayload {
  all_days?: boolean;
  active_days?: number[];
  open_time: string;
  close_time: string;
  barbing_duration?: number;
  capacity_per_slot?: number;
}

export interface PatchBusinessDayPayload {
  is_active?: boolean;
  open_time?: string;
  close_time?: string;
}

export interface UpsertScheduleResponse {
  shop: Shop;
  business_days: BusinessDay[];
}

export const shopsApi = {
  create: (payload: CreateShopPayload) => api.post<Shop>("/shops", payload),

  /** GET /shops/mine — the authenticated owner's shop(s). */
  mine: () => api.get<Shop[]>("/shops/mine"),

  /** GET /shops — public discovery (distance/search/pagination). */
  discover: (params: DiscoverParams = {}) => {
    const qs = new URLSearchParams();
    if (params.lat != null) qs.set("lat", String(params.lat));
    if (params.lng != null) qs.set("lng", String(params.lng));
    if (params.radiusKm != null) qs.set("radius", String(params.radiusKm));
    if (params.search) qs.set("search", params.search);
    qs.set("page", String(params.page ?? 1));
    qs.set("page_size", String(params.pageSize ?? 20));
    return api.get<DiscoverResult>(`/shops?${qs.toString()}`, { auth: false });
  },

  /** Public shop lookup. GET /shops/:id resolves by SLUG on the backend. */
  getBySlug: (slug: string) =>
    api.get<Shop>(`/shops/${encodeURIComponent(slug)}`, { auth: false }),

  /** Owner mutations are keyed by the shop UUID. */
  update: (shopId: string, payload: UpdateShopPayload) =>
    api.patch<Shop>(`/shops/${shopId}`, payload),

  // Business days
  listBusinessDays: (shopId: string) =>
    api.get<BusinessDay[]>(`/shops/${shopId}/business-days`),
  upsertSchedule: (shopId: string, payload: SchedulePayload) =>
    api.post<UpsertScheduleResponse>(`/shops/${shopId}/business-days`, payload),
  patchBusinessDay: (
    shopId: string,
    dayId: string,
    payload: PatchBusinessDayPayload,
  ) => api.patch<BusinessDay>(`/shops/${shopId}/business-days/${dayId}`, payload),

  // Blocked dates
  listBlockedDates: (shopId: string) =>
    api.get<BlockedDate[]>(`/shops/${shopId}/blocked-dates`),
  addBlockedDate: (shopId: string, payload: { date: string; reason?: string }) =>
    api.post<BlockedDate>(`/shops/${shopId}/blocked-dates`, payload),
  deleteBlockedDate: (shopId: string, blockedDateId: string) =>
    api.del<{ message: string }>(
      `/shops/${shopId}/blocked-dates/${blockedDateId}`,
    ),
};
