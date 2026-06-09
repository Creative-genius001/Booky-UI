import { api } from "@/lib/api/client";
import type { AnalyticsSummary } from "@/types";

export const analyticsApi = {
  /** GET /shops/:id/analytics — owner dashboard metrics. */
  summary: (shopId: string, range: "7d" | "30d" | "90d" = "30d") =>
    api.get<AnalyticsSummary>(`/shops/${shopId}/analytics?range=${range}`),
};
