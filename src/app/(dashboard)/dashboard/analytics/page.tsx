"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  UserX,
  Wallet,
} from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useAnalytics } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
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
        description="Track revenue, bookings and how full your shop is."
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
              value={formatKobo(data?.totalRevenueKobo ?? 0)}
              icon={Wallet}
              loading={isLoading}
              accent="primary"
            />
            <StatCard
              label="Bookings"
              value={data?.totalBookings ?? 0}
              icon={CalendarCheck}
              loading={isLoading}
              accent="accent"
            />
            <StatCard
              label="Cancellations"
              value={data?.cancelledBookings ?? 0}
              icon={CalendarX}
              loading={isLoading}
              accent="secondary"
            />
            <StatCard
              label="No shows"
              value={data?.noShowBookings ?? 0}
              icon={UserX}
              loading={isLoading}
              accent="secondary"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Revenue</CardTitle>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="size-4 text-success" />
                  {Math.round((data?.occupancyRate ?? 0) * 100)}% occupancy
                </span>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : data?.revenueSeries?.length ? (
                  <RevenueChart data={data.revenueSeries} />
                ) : (
                  <EmptyState
                    title="No data for this period"
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
                ) : data?.topServices?.length ? (
                  data.topServices.map((s, i) => (
                    <div
                      key={s.serviceId}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.bookings} bookings
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatKobo(s.revenueKobo)}
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
