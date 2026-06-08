import { api } from "@/lib/api/client";
import type { Service } from "@/types";

export interface ServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  priceKobo: number;
  isActive: boolean;
}

export const servicesApi = {
  /** Public list of a shop's services (used by the customer flow). */
  list: (shopId: string) =>
    api.get<Service[]>(`/shops/${shopId}/services`, { auth: false }),

  /** Public single-service lookup. Router: GET /shops/services/:id. */
  get: (serviceId: string) =>
    api.get<Service>(`/shops/services/${serviceId}`, { auth: false }),

  create: (shopId: string, payload: ServiceInput) =>
    api.post<Service>(`/shops/${shopId}/services`, payload),

  update: (shopId: string, serviceId: string, payload: Partial<ServiceInput>) =>
    api.patch<Service>(`/shops/${shopId}/services/${serviceId}`, payload),

  /** Router: DELETE /shops/services/:id. */
  remove: (serviceId: string) => api.del<void>(`/shops/services/${serviceId}`),
};
