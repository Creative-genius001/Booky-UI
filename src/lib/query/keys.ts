export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  shops: {
    detail: (idOrSlug: string) => ["shops", "detail", idOrSlug] as const,
    businessDays: (shopId: string) => ["shops", shopId, "business-days"] as const,
    blockedDates: (shopId: string) => ["shops", shopId, "blocked-dates"] as const,
    analytics: (shopId: string, range: string) =>
      ["shops", shopId, "analytics", range] as const,
  },
  services: {
    list: (shopId: string) => ["services", shopId] as const,
    detail: (serviceId: string) => ["services", "detail", serviceId] as const,
  },
  availability: {
    byDate: (shopId: string, date: string, serviceId?: string) =>
      ["availability", shopId, date, serviceId ?? "any"] as const,
  },
  bookings: {
    list: (shopId: string, status: string, page: number) =>
      ["bookings", shopId, status, page] as const,
    byCode: (code: string) => ["bookings", "code", code] as const,
  },
} as const;
