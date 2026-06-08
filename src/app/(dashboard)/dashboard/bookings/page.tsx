"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useShopBookings } from "@/hooks/use-bookings";
import { PageHeader } from "@/components/dashboard/page-header";
import { BookingDrawer } from "@/components/dashboard/booking-drawer";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { friendlyDate } from "@/lib/dates";
import type { Booking, BookingStatus } from "@/types";

const TABS: { value: string; label: string; status: BookingStatus }[] = [
  { value: "upcoming", label: "Upcoming", status: "confirmed" },
  { value: "completed", label: "Completed", status: "completed" },
  { value: "cancelled", label: "Cancelled", status: "cancelled" },
  { value: "no_shows", label: "No shows", status: "no_show" },
];

export default function BookingsPage() {
  const { shopId } = useActiveShop();
  const [tab, setTab] = useState("upcoming");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const status = TABS.find((t) => t.value === tab)?.status ?? "confirmed";
  const { data, isLoading, isError } = useShopBookings({
    shopId: shopId ?? "",
    status,
    pageSize: 50,
  });

  function openBooking(b: Booking) {
    setSelected(b);
    setDrawerOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage appointments, mark completions and handle no-shows."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex-1 sm:flex-none">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
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
              <div className="space-y-3">
                {data.bookings.map((b) => (
                  <Card key={b.id} interactive onClick={() => openBooking(b)}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <Avatar name={b.customer.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{b.customer.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {b.service?.name ?? "Service"} · {friendlyDate(b.date)} ·{" "}
                          {formatTimeLabel(b.startTime)}
                        </p>
                      </div>
                      <div className="hidden flex-col items-end gap-1 sm:flex">
                        <span className="font-semibold">
                          {formatKobo(b.amountKobo)}
                        </span>
                        <PaymentStatusBadge status={b.paymentStatus} />
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock />}
                title={`No ${t.label.toLowerCase()} bookings`}
                description="When bookings land in this category, they'll show up here."
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      <BookingDrawer
        booking={selected}
        shopId={shopId ?? ""}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
