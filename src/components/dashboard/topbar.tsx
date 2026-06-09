"use client";

import { useState } from "react";
import { Copy, ExternalLink, Menu } from "lucide-react";
import { toast } from "sonner";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useAuthStore } from "@/stores/auth-store";
import { config } from "@/lib/config";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { ShopSwitcher } from "@/components/dashboard/shop-switcher";
import { Skeleton } from "@/components/ui/skeleton";

export function Topbar() {
  const { shop, isLoading } = useActiveShop();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const bookingUrl = shop?.slug ? `${config.appUrl}/book/${shop.slug}` : "";

  function copyLink() {
    if (!bookingUrl) return;
    navigator.clipboard?.writeText(bookingUrl);
    toast.success("Booking link copied");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        {isLoading && !shop ? (
          <Skeleton className="h-9 w-40 rounded-lg" />
        ) : (
          <ShopSwitcher />
        )}
      </div>

      {shop && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="hidden sm:inline-flex"
          >
            <Copy className="size-4" /> Copy link
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Open booking page">
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-[18px]" />
            </a>
          </Button>
        </div>
      )}

      <Avatar name={user?.email} size="sm" />
    </header>
  );
}
