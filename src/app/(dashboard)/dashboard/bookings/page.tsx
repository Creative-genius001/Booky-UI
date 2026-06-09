"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useShopBookings } from "@/hooks/use-bookings";
import { PageHeader } from "@/components/dashboard/page-header";
import { BookingDetailDrawer } from "@/components/dashboard/booking-detail-drawer";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { friendlyDate, isoClock, isoDatePart } from "@/lib/dates";
import type { BookingListItem } from "@/types";

const TABS = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending_payment", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const PAGE_SIZE = 20;

export default function BookingsPage() {
  const { shopId, shopSlug } = useActiveShop();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BookingListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError } = useShopBookings({
    shopId: shopId ?? "",
    status,
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function open(b: BookingListItem) {
    setSelected(b);
    setDrawerOpen(true);
  }

  function changeStatus(v: string) {
    setStatus(v);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Search, filter and review every appointment."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={changeStatus}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search name, email or code"
          value={search}
          leftIcon={<Search />}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<CalendarClock />}
          title="Couldn't load bookings"
          description="There was a problem reaching the server. Please try again."
        />
      ) : data && data.bookings.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.bookings.map((b) => (
              <Card key={b.id} interactive onClick={() => open(b)}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar name={b.customer_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{b.customer_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {b.service_name} · {friendlyDate(isoDatePart(b.starts_at))} ·{" "}
                      {formatTimeLabel(isoClock(b.starts_at))}
                    </p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <span className="font-semibold">{formatKobo(b.amount_kobo)}</span>
                    {b.payment_status && (
                      <PaymentStatusBadge status={b.payment_status} />
                    )}
                  </div>
                  <BookingStatusBadge status={b.status} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} booking{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<CalendarClock />}
          title={search ? "No matching bookings" : "No bookings yet"}
          description={
            search
              ? "Try a different search or filter."
              : "When customers book through your link, they'll appear here."
          }
        />
      )}

      <BookingDetailDrawer
        booking={selected}
        shopSlug={shopSlug ?? undefined}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
