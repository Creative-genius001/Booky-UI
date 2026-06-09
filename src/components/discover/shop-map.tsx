"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { config } from "@/lib/config";
import type { ShopCard } from "@/types";

interface ShopMapProps {
  shops: ShopCard[];
  center: { lat: number; lng: number } | null;
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
}

export default function ShopMap({ shops, center, activeSlug, onSelect }: ShopMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !config.mapboxToken) return;
    mapboxgl.accessToken = config.mapboxToken;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center ? [center.lng, center.lat] : [3.3792, 6.5244], // Lagos
      zoom: center ? 12 : 10,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center]);

  // Sync markers when shops change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const pts = shops.filter((s) => s.latitude != null && s.longitude != null);
    const bounds = new mapboxgl.LngLatBounds();

    if (center) bounds.extend([center.lng, center.lat]);

    pts.forEach((s) => {
      const el = document.createElement("button");
      el.className =
        "size-7 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110";
      el.style.background =
        s.slug === activeSlug ? "hsl(247 95% 77%)" : "hsl(16 75% 52%)";
      el.setAttribute("aria-label", s.name);
      el.addEventListener("click", () => onSelect?.(s.slug));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([s.longitude as number, s.latitude as number])
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(s.name))
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([s.longitude as number, s.latitude as number]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    }
  }, [shops, center, activeSlug, onSelect]);

  return <div ref={containerRef} className="h-full w-full" />;
}
