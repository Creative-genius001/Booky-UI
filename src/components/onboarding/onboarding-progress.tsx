import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Shop details" },
  { n: 2, label: "Booking rules" },
  { n: 3, label: "Business hours" },
];

export function OnboardingProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Step {current} of 3
      </p>
      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary/15 text-primary ring-2 ring-primary/30",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : s.n}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
