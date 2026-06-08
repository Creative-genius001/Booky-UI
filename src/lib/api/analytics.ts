import { api } from "@/lib/api/client";
import type { AnalyticsSummary } from "@/types";

export const analyticsApi = {
  /** Owner analytics for a shop. Endpoint inferred (GET /shops/:id/analytics). */
  summary: (shopId: string, range: "7d" | "30d" | "90d" = "30d") =>
    api.get<AnalyticsSummary>(`/shops/${shopId}/analytics?range=${range}`),
};
