"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { bookingConfigSchema, type BookingConfigForm } from "@/lib/validation";
import { useUpdateShop } from "@/hooks/use-shop-admin";
import { useShopStore } from "@/stores/shop-store";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FIELDS: {
  name: keyof BookingConfigForm;
  label: string;
  hint: string;
  suffix?: string;
}[] = [
  { name: "capacity", label: "Shop capacity", hint: "How many customers can be served in the same slot.", suffix: "people" },
  { name: "bookingWindowDays", label: "Booking window", hint: "How far ahead customers can book.", suffix: "days" },
  { name: "slotIntervalMinutes", label: "Slot interval", hint: "Gap between bookable start times.", suffix: "min" },
  { name: "bufferMinutes", label: "Buffer between bookings", hint: "Breathing room after each appointment.", suffix: "min" },
  { name: "cancellationHours", label: "Cancellation notice", hint: "Minimum notice required to cancel.", suffix: "hrs" },
];

export default function BookingConfigPage() {
  const router = useRouter();
  const activeShopId = useShopStore((s) => s.activeShopId);
  const update = useUpdateShop(activeShopId ?? "");

  useEffect(() => {
    if (!activeShopId) router.replace("/onboarding/shop");
  }, [activeShopId, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingConfigForm>({
    resolver: zodResolver(bookingConfigSchema),
    defaultValues: {
      capacity: 3,
      bookingWindowDays: 14,
      slotIntervalMinutes: 30,
      bufferMinutes: 0,
      cancellationHours: 2,
    },
  });

  function submit(values: BookingConfigForm) {
    update.mutate(values, {
      onSuccess: () => router.push("/onboarding/business-hours"),
    });
  }

  return (
    <div>
      <OnboardingProgress current={2} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Booking rules</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set how bookings work. You can fine-tune these any time in Settings.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {FIELDS.map((f) => (
          <FormField
            key={f.name}
            label={f.label}
            htmlFor={f.name}
            required
            error={errors[f.name]?.message}
            hint={!errors[f.name] ? f.hint : undefined}
          >
            <Input
              id={f.name}
              type="number"
              inputMode="numeric"
              invalid={!!errors[f.name]}
              rightSlot={
                f.suffix ? (
                  <span className="pr-2 text-xs text-muted-foreground">
                    {f.suffix}
                  </span>
                ) : undefined
              }
              {...register(f.name)}
            />
          </FormField>
        ))}

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
