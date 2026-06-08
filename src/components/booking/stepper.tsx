"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { BOOKING_STEPS, type BookingStep } from "@/stores/booking-store";
import { cn } from "@/lib/utils";

const LABELS: Record<BookingStep, string> = {
  service: "Service",
  date: "Date",
  time: "Time",
  details: "Details",
  payment: "Payment",
};

export function Stepper({
  current,
  reachableIndex,
  onStepClick,
}: {
  current: BookingStep;
  reachableIndex: number;
  onStepClick?: (step: BookingStep) => void;
}) {
  const currentIndex = BOOKING_STEPS.indexOf(current);

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center">
        {BOOKING_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isReachable = i <= reachableIndex;
          return (
            <li
              key={step}
              className={cn("flex items-center", i < BOOKING_STEPS.length - 1 && "flex-1")}
            >
              <button
                type="button"
                disabled={!isReachable || !onStepClick}
                onClick={() => isReachable && onStepClick?.(step)}
                className={cn(
                  "group flex flex-col items-center gap-1.5",
                  isReachable && onStepClick && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-card text-primary",
                    !isDone && !isCurrent && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {LABELS[step]}
                </span>
              </button>
              {i < BOOKING_STEPS.length - 1 && (
                <div className="relative mx-1.5 h-0.5 flex-1 overflow-hidden rounded-full bg-border sm:mx-2">
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={false}
                    animate={{ scaleX: i < currentIndex ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
