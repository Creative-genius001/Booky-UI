"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarX,
  Clock,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useAnalytics } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

// The SVG chart is only needed on this page — load it on the client on demand.
const RevenueChart = dynamic(
  () => import("@/components/dashboard/revenue-chart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn, formatKobo } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

export default function AnalyticsPage() {
  const { shopId } = useActiveShop();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading, isError } = useAnalytics(shopId ?? undefined, range);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track revenue and bookings for your shop."
        action={
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? "default" : "ghost"}
                size="sm"
                className={cn("h-8", range !== r.value && "text-muted-foreground")}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        }
      />

      {isError ? (
        <EmptyState
          icon={<BarChart3 />}
          title="Analytics unavailable"
          description="We couldn't load analytics for this shop right now. Please try again later."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatKobo(data?.total_revenue_kobo ?? 0)}
              icon={Wallet}
              loading={isLoading}
              accent="primary"
            />
            <StatCard
              label="Confirmed"
              value={data?.confirmed_bookings ?? 0}
              icon={CalendarCheck}
              loading={isLoading}
              accent="success"
            />
            <StatCard
              label="Total bookings"
              value={data?.total_bookings ?? 0}
              icon={Clock}
              loading={isLoading}
              accent="accent"
            />
            <StatCard
              label="Cancelled"
              value={data?.cancelled_bookings ?? 0}
              icon={CalendarX}
              loading={isLoading}
              accent="secondary"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : data?.revenue_series?.length ? (
                  <RevenueChart data={data.revenue_series} />
                ) : (
                  <EmptyState
                    title="No revenue in this period"
                    className="border-0 bg-transparent py-8"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))
                ) : data?.top_services?.length ? (
                  data.top_services.map((s, i) => (
                    <div
                      key={s.service_id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.bookings} booking{s.bookings === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatKobo(s.revenue_kobo)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No service data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
