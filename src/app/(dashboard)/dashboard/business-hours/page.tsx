"use client";

import { useActiveShop } from "@/hooks/use-active-shop";
import {
  useBusinessDays,
  usePatchBusinessDay,
  useUpsertSchedule,
} from "@/hooks/use-shop-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  BusinessHoursEditor,
  type DayChange,
} from "@/components/shop/business-hours-editor";
import { ScheduleEditor } from "@/components/shop/schedule-editor";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessHoursPage() {
  const { shopId } = useActiveShop();
  const { data: days, isLoading } = useBusinessDays(shopId ?? undefined);
  const patchDay = usePatchBusinessDay(shopId ?? "");
  const upsert = useUpsertSchedule(shopId ?? "");

  async function saveChanges(changed: DayChange[]) {
    // Persist each edited day independently via PATCH.
    for (const c of changed) {
      await patchDay.mutateAsync({
        dayId: c.id,
        input: {
          is_active: c.is_active,
          open_time: c.open_time,
          close_time: c.close_time,
        },
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Business Hours"
        description="Set when your shop accepts bookings each day of the week."
      />

      {isLoading ? (
        <Skeleton className="h-[420px] w-full rounded-xl" />
      ) : days && days.length > 0 ? (
        <BusinessHoursEditor
          days={days}
          saving={patchDay.isPending}
          onSave={saveChanges}
        />
      ) : (
        <ScheduleEditor
          saving={upsert.isPending}
          saveLabel="Set hours"
          onSave={(payload) => upsert.mutate(payload)}
        />
      )}
    </div>
  );
}
