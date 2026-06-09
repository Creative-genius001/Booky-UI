import { api } from "@/lib/api/client";
import type { Service } from "@/types";

/**
 * The backend service create/update payload. Note `barbing_duration` maps to
 * the model's `duration_in_minutes`, and `price` is in Naira (whole units).
 */
export interface ServicePayload {
  name: string;
  description?: string;
  price: number;
  barbing_duration: number;
}

export const servicesApi = {
  /** Public list of a shop's services (used by the customer flow). */
  list: (shopId: string) =>
    api.get<Service[]>(`/shops/${shopId}/services`, { auth: false }),

  /** Public single-service lookup. GET /shops/services/:id. */
  get: (serviceId: string) =>
    api.get<Service>(`/shops/services/${serviceId}`, { auth: false }),

  create: (shopId: string, payload: ServicePayload) =>
    api.post<Service>(`/shops/${shopId}/services`, payload),

  update: (shopId: string, serviceId: string, payload: ServicePayload) =>
    api.patch<Service>(`/shops/${shopId}/services/${serviceId}`, payload),

  /** DELETE /shops/services/:id. */
  remove: (serviceId: string) =>
    api.del<{ message: string }>(`/shops/services/${serviceId}`),
};
