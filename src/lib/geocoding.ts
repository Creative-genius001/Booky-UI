import { config } from "@/lib/config";

export interface GeocodeSuggestion {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

/**
 * Forward-geocode an address via the Mapbox Geocoding API. Returns [] when no
 * token is configured so callers degrade gracefully.
 */
export async function geocodeAddress(
  query: string,
  opts: { signal?: AbortSignal; limit?: number } = {},
): Promise<GeocodeSuggestion[]> {
  const q = query.trim();
  if (!q || !config.mapboxToken) return [];

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json` +
    `?access_token=${config.mapboxToken}&autocomplete=true&limit=${opts.limit ?? 5}`;

  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: MapboxFeature[] };
  return (data.features ?? []).map((f) => ({
    id: f.id,
    placeName: f.place_name,
    longitude: f.center[0],
    latitude: f.center[1],
  }));
}

export const mapsEnabled = () => !!config.mapboxToken;
