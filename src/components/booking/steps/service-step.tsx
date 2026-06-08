"use client";

import { Check, Clock, Scissors } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { useBookingStore } from "@/stores/booking-store";
import { formatKobo, formatDuration, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import type { Service } from "@/types";

export function ServiceStep({
  shopId,
  onNext,
}: {
  shopId: string;
  onNext: () => void;
}) {
  const { data: services, isLoading, isError, refetch } = useServices(shopId, {
    activeOnly: true,
  });
  const selected = useBookingStore((s) => s.service);
  const selectService = useBookingStore((s) => s.selectService);

  function choose(service: Service) {
    selectService(service);
    // Small delay lets the selection animation register before advancing.
    setTimeout(onNext, 160);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" title="Couldn't load services">
        <button onClick={() => refetch()} className="font-medium underline">
          Try again
        </button>
      </Alert>
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        icon={<Scissors />}
        title="No services available"
        description="This shop hasn't published any services yet. Please check back soon."
      />
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const isSelected = selected?.id === service.id;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => choose(service)}
            aria-pressed={isSelected}
            className={cn(
              "group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all",
              "hover:border-primary/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
            )}
          >
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              {isSelected ? <Check className="size-5" /> : <Scissors className="size-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{service.name}</p>
              {service.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {formatDuration(service.durationMinutes)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-foreground">
                {formatKobo(service.priceKobo)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
