import { api } from "@/lib/api/client";
import type { AvailabilityResponse } from "@/types";

export interface AvailabilityParams {
  shopId: string;
  date: string; // YYYY-MM-DD
  serviceId?: string;
}

export const availabilityApi = {
  /** Router: GET /shops/:id/availability?date=&serviceId= (public). */
  get: ({ shopId, date, serviceId }: AvailabilityParams) => {
    const qs = new URLSearchParams({ date });
    if (serviceId) qs.set("serviceId", serviceId);
    return api.get<AvailabilityResponse>(
      `/shops/${shopId}/availability?${qs.toString()}`,
      { auth: false },
    );
  },
};
