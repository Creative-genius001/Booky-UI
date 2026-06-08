"use client";

import Link from "next/link";
import {
  CalendarClock,
  CalendarCheck,
  Copy,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useAnalytics } from "@/hooks/use-analytics";
import { useShopBookings } from "@/hooks/use-bookings";
import { config } from "@/lib/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { friendlyDate } from "@/lib/dates";

export default function DashboardOverview() {
  const { shop, shopId } = useActiveShop();
  const { data: analytics, isLoading } = useAnalytics(shopId ?? undefined, "30d");
  const { data: upcoming } = useShopBookings({
    shopId: shopId ?? "",
    status: "confirmed",
    pageSize: 5,
  });

  const bookingUrl = shop ? `${config.appUrl}/book/${shop.slug}` : "";

  return (
    <div>
      <PageHeader
        title={`Welcome${shop ? `, ${shop.name}` : ""}`}
        description="Here's how your shop is doing at a glance."
        action={
          <Button asChild>
            <Link href="/dashboard/bookings">
              View bookings <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {/* Share link banner */}
      {shop && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Your booking link
              </p>
              <p className="truncate text-sm text-muted-foreground">{bookingUrl}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-card"
              onClick={() => {
                navigator.clipboard?.writeText(bookingUrl);
                toast.success("Booking link copied");
              }}
            >
              <Copy className="size-4" /> Copy link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatKobo(analytics?.totalRevenueKobo ?? 0)}
          icon={Wallet}
          loading={isLoading}
          accent="primary"
        />
        <StatCard
          label="Total bookings"
          value={analytics?.totalBookings ?? 0}
          icon={CalendarClock}
          loading={isLoading}
          accent="accent"
        />
        <StatCard
          label="Completed"
          value={analytics?.completedBookings ?? 0}
          icon={CalendarCheck}
          loading={isLoading}
          accent="success"
        />
        <StatCard
          label="Occupancy"
          value={`${Math.round((analytics?.occupancyRate ?? 0) * 100)}%`}
          icon={TrendingUp}
          loading={isLoading}
          accent="secondary"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : analytics?.revenueSeries?.length ? (
              <RevenueChart data={analytics.revenueSeries} />
            ) : (
              <EmptyState
                title="No revenue yet"
                description="Once customers start booking, your revenue trend appears here."
                className="border-0 bg-transparent py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming bookings */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/dashboard/bookings">See all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming?.bookings?.length ? (
              upcoming.bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {b.customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {friendlyDate(b.date)} · {formatTimeLabel(b.startTime)}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming bookings yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
