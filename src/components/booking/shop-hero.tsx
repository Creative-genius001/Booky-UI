"use client";

import Image from "next/image";
import { Mail, Phone, MapPin, Clock3 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Shop } from "@/types";

export function ShopHero({ shop }: { shop: Shop }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative h-28 w-full bg-gradient-to-br from-primary/80 via-primary to-accent sm:h-36">
        {shop.cover_image_url && (
          <Image
            src={shop.cover_image_url}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        )}
      </div>
      <div className="relative px-5 pb-5">
        <div className="-mt-8 flex items-end gap-3">
          <Avatar
            src={shop.logo_url || undefined}
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
          {shop.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> {shop.email}
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
