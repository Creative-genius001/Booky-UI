"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import {
  geocodeAddress,
  mapsEnabled,
  type GeocodeSuggestion,
} from "@/lib/geocoding";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  invalid?: boolean;
  placeholder?: string;
  onChange: (address: string) => void;
  /** Fired when a suggestion is picked — provides coordinates. */
  onSelect: (s: { address: string; latitude: number; longitude: number }) => void;
}

export function AddressAutocomplete({
  id,
  value,
  invalid,
  placeholder = "Search your address",
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding.
  useEffect(() => {
    if (!mapsEnabled() || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const res = await geocodeAddress(value, { signal: ctrl.signal }).catch(
        () => [],
      );
      setSuggestions(res);
      setOpen(res.length > 0);
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <Input
        id={id}
        value={value}
        invalid={invalid}
        placeholder={placeholder}
        leftIcon={<MapPin />}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-elevated">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onChange(s.placeName);
                  onSelect({
                    address: s.placeName,
                    latitude: s.latitude,
                    longitude: s.longitude,
                  });
                  setOpen(false);
                }}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{s.placeName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
