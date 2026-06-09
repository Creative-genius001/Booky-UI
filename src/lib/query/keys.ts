export const queryKeys = {
  shops: {
    mine: ["shops", "mine"] as const,
    discover: (key: string) => ["shops", "discover", key] as const,
    detail: (slug: string) => ["shops", "detail", slug] as const,
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
    byDate: (shopSlug: string, date: string) =>
      ["availability", shopSlug, date] as const,
  },
  bookings: {
    list: (shopId: string, status: string, search: string, page: number) =>
      ["bookings", shopId, status, search, page] as const,
    byCode: (code: string) => ["bookings", "code", code] as const,
  },
  payouts: {
    banks: ["payouts", "banks"] as const,
    bankAccount: (shopId: string) => ["payouts", shopId, "bank-account"] as const,
    wallet: (shopId: string) => ["payouts", shopId, "wallet"] as const,
    entries: (shopId: string) => ["payouts", shopId, "entries"] as const,
    withdrawals: (shopId: string) => ["payouts", shopId, "withdrawals"] as const,
  },
} as const;
