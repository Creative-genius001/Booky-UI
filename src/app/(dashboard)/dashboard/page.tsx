"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Copy,
  Scissors,
  Users,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useServices } from "@/hooks/use-services";
import { useBusinessDays } from "@/hooks/use-shop-admin";
import { config } from "@/lib/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export default function DashboardOverview() {
  const { shop, shopId, shopSlug } = useActiveShop();
  const { data: services, isLoading: servicesLoading } = useServices(
    shopId ?? undefined,
  );
  const { data: days } = useBusinessDays(shopId ?? undefined);

  const bookingUrl = shopSlug ? `${config.appUrl}/book/${shopSlug}` : "";
  const activeServices = services?.filter((s) => s.is_active).length ?? 0;
  const openDays = days?.filter((d) => d.is_active).length ?? 0;

  return (
    <div>
      <PageHeader
        title={`Welcome${shop ? `, ${shop.name}` : ""}`}
        description="Manage your services, hours and bookings from here."
        action={
          <Button asChild>
            <Link href="/dashboard/services">
              Manage services <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {shop && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Your booking link
              </p>
              <p className="truncate text-sm text-muted-foreground">{bookingUrl}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-card"
                onClick={() => {
                  navigator.clipboard?.writeText(bookingUrl);
                  toast.success("Booking link copied");
                }}
              >
                <Copy className="size-4" /> Copy
              </Button>
              <Button asChild variant="outline" size="sm" className="bg-card">
                <a href={bookingUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" /> Open
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Active services"
          value={activeServices}
          icon={Scissors}
          loading={servicesLoading}
          accent="primary"
        />
        <StatCard
          label="Capacity / slot"
          value={shop?.capacity_per_slot ?? "—"}
          icon={Users}
          accent="accent"
        />
        <StatCard
          label="Open days"
          value={`${openDays}/7`}
          icon={Clock}
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/dashboard/services"
          title="Services"
          description={
            shop
              ? `Default appointment ${formatDuration(shop.barbing_duration)}`
              : "Create the services customers can book"
          }
          icon={<Scissors className="size-5" />}
        />
        <QuickLink
          href="/dashboard/business-hours"
          title="Business hours"
          description="Set the days and times you're open"
          icon={<Clock className="size-5" />}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card interactive>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{title}</p>
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
