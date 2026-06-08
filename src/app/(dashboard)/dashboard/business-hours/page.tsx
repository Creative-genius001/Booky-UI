"use client";

import { useActiveShop } from "@/hooks/use-active-shop";
import { useBusinessDays, useUpsertBusinessDays } from "@/hooks/use-shop-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  BusinessHoursEditor,
  toEditorDays,
} from "@/components/shop/business-hours-editor";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessHoursPage() {
  const { shopId } = useActiveShop();
  const { data, isLoading } = useBusinessDays(shopId ?? undefined);
  const upsert = useUpsertBusinessDays(shopId ?? "");

  return (
    <div>
      <PageHeader
        title="Business Hours"
        description="Set when your shop accepts bookings each day of the week."
      />

      {isLoading ? (
        <Skeleton className="h-[420px] w-full rounded-xl" />
      ) : (
        <BusinessHoursEditor
          // Re-mount when the loaded data changes so the editor seeds correctly.
          key={data ? "loaded" : "default"}
          initial={toEditorDays(data)}
          saving={upsert.isPending}
          onSave={(days) => upsert.mutate(days)}
        />
      )}
    </div>
  );
}
