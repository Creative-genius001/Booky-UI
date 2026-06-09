"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { capacityConfigSchema, type CapacityConfigForm } from "@/lib/validation";
import { useUpdateShop } from "@/hooks/use-shop-admin";
import { useShopStore } from "@/stores/shop-store";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BookingConfigPage() {
  const router = useRouter();
  const activeShopId = useShopStore((s) => s.activeShopId);
  const activeShopSlug = useShopStore((s) => s.activeShopSlug);
  const update = useUpdateShop(activeShopId ?? "", activeShopSlug ?? undefined);

  useEffect(() => {
    if (!activeShopId) router.replace("/onboarding/shop");
  }, [activeShopId, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CapacityConfigForm>({
    resolver: zodResolver(capacityConfigSchema),
    defaultValues: { capacity_per_slot: 1, barbing_duration: 60 },
  });

  function submit(values: CapacityConfigForm) {
    update.mutate(values, {
      onSuccess: () => router.push("/onboarding/business-hours"),
    });
  }

  return (
    <div>
      <OnboardingProgress current={2} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Capacity & timing</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          How many customers you serve at once, and how long an appointment
          takes. You can change these later in Settings.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FormField
          label="Capacity per slot"
          htmlFor="capacity_per_slot"
          required
          error={errors.capacity_per_slot?.message}
          hint={
            !errors.capacity_per_slot
              ? "How many customers can be served in the same time slot."
              : undefined
          }
        >
          <Input
            id="capacity_per_slot"
            type="number"
            inputMode="numeric"
            invalid={!!errors.capacity_per_slot}
            rightSlot={
              <span className="pr-2 text-xs text-muted-foreground">people</span>
            }
            {...register("capacity_per_slot")}
          />
        </FormField>

        <FormField
          label="Appointment length"
          htmlFor="barbing_duration"
          required
          error={errors.barbing_duration?.message}
          hint={
            !errors.barbing_duration
              ? "Default duration of a single appointment (max 120 minutes)."
              : undefined
          }
        >
          <Input
            id="barbing_duration"
            type="number"
            inputMode="numeric"
            invalid={!!errors.barbing_duration}
            rightSlot={
              <span className="pr-2 text-xs text-muted-foreground">min</span>
            }
            {...register("barbing_duration")}
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/onboarding/shop")}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            loading={update.isPending}
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
