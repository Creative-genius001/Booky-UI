"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useShop } from "@/hooks/use-shop";
import {
  BOOKING_STEPS,
  useBookingStore,
  type BookingStep,
} from "@/stores/booking-store";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/components/booking/stepper";
import { ShopHero } from "@/components/booking/shop-hero";
import { BookingSummary } from "@/components/booking/booking-summary";
import { ServiceStep } from "@/components/booking/steps/service-step";
import { DateStep } from "@/components/booking/steps/date-step";
import { TimeStep } from "@/components/booking/steps/time-step";
import { DetailsStep } from "@/components/booking/steps/details-step";
import { PaymentStep } from "@/components/booking/steps/payment-step";
import { BookingFlowSkeleton } from "@/components/booking/booking-skeleton";
import { ShopNotFound } from "@/components/booking/shop-not-found";
import { formatNaira } from "@/lib/utils";

const STEP_TITLES: Record<BookingStep, string> = {
  service: "Choose a service",
  date: "Pick a date",
  time: "Select a time",
  details: "Your details",
  payment: "Confirm & pay",
};

const DETAILS_FORM_ID = "booking-details-form";

export function BookingFlow({ slug }: { slug: string }) {
  const { data: shop, isLoading, isError } = useShop(slug);
  const setShop = useBookingStore((s) => s.setShop);
  const furthestStep = useBookingStore((s) => s.furthestStep);
  const service = useBookingStore((s) => s.service);
  const date = useBookingStore((s) => s.date);
  const startTime = useBookingStore((s) => s.startTime);

  const [active, setActive] = useState<BookingStep>("service");
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (shop) setShop(slug, shop);
  }, [shop, slug, setShop]);

  const activeIndex = BOOKING_STEPS.indexOf(active);
  const reachableIndex = BOOKING_STEPS.indexOf(furthestStep());

  function goTo(step: BookingStep) {
    setDirection(BOOKING_STEPS.indexOf(step) >= activeIndex ? 1 : -1);
    setActive(step);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    const i = Math.min(activeIndex + 1, BOOKING_STEPS.length - 1);
    goTo(BOOKING_STEPS[i]);
  }
  function back() {
    const i = Math.max(activeIndex - 1, 0);
    goTo(BOOKING_STEPS[i]);
  }

  const canContinue = useMemo(() => {
    switch (active) {
      case "service":
        return !!service;
      case "date":
        return !!date;
      case "time":
        return !!startTime;
      default:
        return true;
    }
  }, [active, service, date, startTime]);

  if (isLoading) return <BookingFlowSkeleton />;
  if (isError || !shop) return <ShopNotFound slug={slug} />;

  const showFooter = active !== "payment";

  return (
    <div className="min-h-dvh pb-28 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Logo size="sm" />
          <span className="text-xs font-medium text-muted-foreground">
            Secure booking
          </span>
        </div>
      </header>

      <div className="container max-w-5xl py-5">
        <ShopHero shop={shop} />

        <div className="mt-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
          <div>
            <div className="mb-5">
              <Stepper
                current={active}
                reachableIndex={reachableIndex}
                onStepClick={goTo}
              />
            </div>

            <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">
              {STEP_TITLES[active]}
            </h2>

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {active === "service" && (
                    <ServiceStep shopId={shop.id} onNext={next} />
                  )}
                  {active === "date" && <DateStep onNext={next} />}
                  {active === "time" && (
                    <TimeStep shopSlug={shop.slug} onNext={next} />
                  )}
                  {active === "details" && (
                    <DetailsStep formId={DETAILS_FORM_ID} onValid={next} />
                  )}
                  {active === "payment" && (
                    <PaymentStep onEditDetails={() => goTo("details")} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Booking summary
                  </h3>
                  {service ? (
                    <BookingSummary />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a service to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
              {showFooter && (
                <DesktopActions
                  active={active}
                  canContinue={canContinue}
                  onBack={back}
                  onContinue={next}
                  isFirst={activeIndex === 0}
                  detailsFormId={DETAILS_FORM_ID}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {showFooter && (
        <MobileFooter
          active={active}
          canContinue={canContinue}
          onBack={back}
          onContinue={next}
          isFirst={activeIndex === 0}
          detailsFormId={DETAILS_FORM_ID}
          priceNaira={service?.price}
        />
      )}
    </div>
  );
}

function DesktopActions({
  active,
  canContinue,
  onBack,
  onContinue,
  isFirst,
  detailsFormId,
}: {
  active: BookingStep;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  isFirst: boolean;
  detailsFormId: string;
}) {
  return (
    <div className="mt-3 flex gap-2">
      {!isFirst && (
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="size-4" /> Back
        </Button>
      )}
      {active === "details" ? (
        <Button type="submit" form={detailsFormId} className="flex-1">
          Continue <ArrowRight className="size-4" />
        </Button>
      ) : (
        <Button className="flex-1" disabled={!canContinue} onClick={onContinue}>
          Continue <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

function MobileFooter({
  active,
  canContinue,
  onBack,
  onContinue,
  isFirst,
  detailsFormId,
  priceNaira,
}: {
  active: BookingStep;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  isFirst: boolean;
  detailsFormId: string;
  priceNaira?: number;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur safe-bottom lg:hidden">
      <div className="container flex items-center gap-3 py-3">
        {!isFirst && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            aria-label="Back"
            className="shrink-0"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="flex flex-1 items-center gap-3">
          {priceNaira != null && (
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-muted-foreground">Total</span>
              <span className="text-sm font-bold">{formatNaira(priceNaira)}</span>
            </div>
          )}
          {active === "details" ? (
            <Button type="submit" form={detailsFormId} className="flex-1">
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={!canContinue}
              onClick={onContinue}
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
