"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LocateFixed, MapPin, Search, Store } from "lucide-react";
import { useDiscovery } from "@/hooks/use-discovery";
import { mapsEnabled } from "@/lib/geocoding";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import type { ShopCard } from "@/types";

const ShopMap = dynamic(() => import("@/components/discover/shop-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const { data, isLoading } = useDiscovery({
    lat: coords?.lat,
    lng: coords?.lng,
    radiusKm: coords ? 50 : undefined,
    search: search.trim() || undefined,
    pageSize: 50,
  });

  const shops = useMemo<ShopCard[]>(() => data?.shops ?? [], [data]);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        toast.error("Couldn't get your location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/signup">List your shop</Link>
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Find a barbershop near you</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by name or area, or use your location to sort by distance.
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search shops or areas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search />}
            className="sm:max-w-md"
          />
          <Button variant="outline" onClick={useMyLocation} loading={locating}>
            <LocateFixed className="size-4" /> Use my location
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))
            ) : shops.length === 0 ? (
              <EmptyState
                icon={<Store />}
                title="No shops found"
                description="Try a different search, or check back as more shops join Bookly."
              />
            ) : (
              shops.map((shop) => (
                <Card
                  key={shop.id}
                  interactive
                  className={active === shop.slug ? "ring-2 ring-primary/30" : ""}
                  onMouseEnter={() => setActive(shop.slug)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <Avatar src={shop.logo_url || undefined} name={shop.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{shop.name}</p>
                      {shop.address && (
                        <p className="mt-0.5 inline-flex items-center gap-1 truncate text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" /> {shop.address}
                        </p>
                      )}
                      {shop.distance_km != null && (
                        <Badge variant="muted" className="mt-1">
                          {shop.distance_km.toFixed(1)} km away
                        </Badge>
                      )}
                    </div>
                    <Button asChild size="sm" className="shrink-0">
                      <Link href={`/book/${shop.slug}`}>Book</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Map */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[70vh] overflow-hidden rounded-xl border border-border">
              {mapsEnabled() ? (
                <ShopMap
                  shops={shops}
                  center={coords}
                  activeSlug={active}
                  onSelect={setActive}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted/40 px-6 text-center text-sm text-muted-foreground">
                  Set <code className="mx-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> to show
                  the interactive map.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
