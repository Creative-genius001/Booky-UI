"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUpsertBusinessDays } from "@/hooks/use-shop-admin";
import { useShopStore } from "@/stores/shop-store";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import {
  BusinessHoursEditor,
  defaultBusinessDays,
} from "@/components/shop/business-hours-editor";
import { Button } from "@/components/ui/button";

export default function BusinessHoursPage() {
  const router = useRouter();
  const activeShopId = useShopStore((s) => s.activeShopId);
  const setOnboardingComplete = useShopStore((s) => s.setOnboardingComplete);
  const upsert = useUpsertBusinessDays(activeShopId ?? "");

  useEffect(() => {
    if (!activeShopId) router.replace("/onboarding/shop");
  }, [activeShopId, router]);

  return (
    <div>
      <OnboardingProgress current={3} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Business hours</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set when your shop is open. This is the last step — you're almost done.
        </p>
      </div>

      <BusinessHoursEditor
        initial={defaultBusinessDays()}
        saving={upsert.isPending}
        saveLabel="Finish setup"
        onSave={(days) =>
          upsert.mutate(days, {
            onSuccess: () => {
              setOnboardingComplete(true);
              router.push("/dashboard");
            },
          })
        }
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/booking-config")}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
        }
      />
    </div>
  );
}
