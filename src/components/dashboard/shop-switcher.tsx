"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { useMyShops } from "@/hooks/use-my-shops";
import { useShopStore } from "@/stores/shop-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ShopSwitcher() {
  const router = useRouter();
  const { data: shops, isLoading } = useMyShops();
  const activeShopId = useShopStore((s) => s.activeShopId);
  const setActiveShop = useShopStore((s) => s.setActiveShop);
  const [open, setOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-9 w-40 rounded-lg" />;
  if (!shops || shops.length === 0) return null;

  const active = shops.find((s) => s.id === activeShopId) ?? shops[0];

  // With a single shop there's nothing to switch — just show the name.
  if (shops.length === 1) {
    return (
      <span className="flex items-center gap-2 truncate text-sm font-semibold">
        <Store className="size-4 shrink-0 text-primary" />
        <span className="truncate">{active.name}</span>
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex max-w-[220px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Switch shop"
        >
          <Store className="size-4 shrink-0 text-primary" />
          <span className="truncate">{active.name}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Your shops
        </p>
        <div className="max-h-64 overflow-y-auto">
          {shops.map((shop) => {
            const isActive = shop.id === active.id;
            return (
              <button
                key={shop.id}
                onClick={() => {
                  setActiveShop(shop.id, shop.slug);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
                  isActive && "bg-muted/60",
                )}
              >
                <Store className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{shop.name}</span>
                {isActive && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/onboarding/shop");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="size-4" /> Create new shop
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
