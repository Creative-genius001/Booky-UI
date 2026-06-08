/* eslint-disable @next/next/no-img-element */
"use client";

import { MapPin, Phone, Clock3 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Shop } from "@/types";

export function ShopHero({ shop }: { shop: Shop }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative h-28 w-full bg-gradient-to-br from-primary/80 via-primary to-accent sm:h-36">
        {shop.coverImageUrl && (
          <img
            src={shop.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="relative px-5 pb-5">
        <div className="-mt-8 flex items-end gap-3">
          <Avatar
            src={shop.logoUrl}
            name={shop.name}
            size="lg"
            className="ring-4 ring-card"
          />
          <div className="pb-1">
            <h1 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
              {shop.name}
            </h1>
          </div>
        </div>
        {shop.description && (
          <p className="mt-3 text-sm text-muted-foreground">{shop.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {shop.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {shop.address}
            </span>
          )}
          {shop.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> {shop.phone}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" /> Instant confirmation
          </span>
        </div>
      </div>
    </div>
  );
}
