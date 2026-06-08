/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const;

export function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/30 font-semibold text-secondary",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name ?? "")}</span>
      )}
    </div>
  );
}
