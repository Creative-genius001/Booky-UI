import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount stored in kobo (smallest NGN unit) to a Naira string. */
export function formatKobo(kobo: number, opts: { withSymbol?: boolean } = {}) {
  const { withSymbol = true } = opts;
  const naira = (kobo ?? 0) / 100;
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: naira % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(naira);
  return withSymbol ? `₦${formatted}` : formatted;
}

/** Format a plain Naira number (not kobo). */
export function formatNaira(naira: number, opts: { withSymbol?: boolean } = {}) {
  return formatKobo((naira ?? 0) * 100, opts);
}

/** Convert a "HH:mm" or "HH:mm:ss" string to a friendly "9:00 AM". */
export function formatTimeLabel(time: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Minutes -> "1h 30m" / "45m". */
export function formatDuration(minutes: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
