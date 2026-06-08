import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/brand/logo";

export function BookingFlowSkeleton() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Logo size="sm" />
        </div>
      </header>
      <div className="container max-w-5xl py-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="mt-6 space-y-5">
          <Skeleton className="h-8 w-full max-w-md rounded-lg" />
          <Skeleton className="h-7 w-48 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
