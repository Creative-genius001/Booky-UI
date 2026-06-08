import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
  const text = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft",
          box,
        )}
      >
        <Scissors className="size-1/2" />
      </span>
      {showText && (
        <span className={cn("font-bold tracking-tight text-secondary", text)}>
          Bookly
        </span>
      )}
    </span>
  );
}
