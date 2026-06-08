import {
  addDays,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

/** "YYYY-MM-DD" for a Date in local time. */
export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Friendly label like "Today", "Tomorrow", or "Mon, 9 Jun". */
export function friendlyDate(iso: string): string {
  const date = fromISODate(iso);
  const today = startOfDay(new Date());
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
  return format(date, "EEE, d MMM");
}

export function longDate(iso: string): string {
  return format(fromISODate(iso), "EEEE, d MMMM yyyy");
}

export function isPastDate(iso: string): boolean {
  return isBefore(fromISODate(iso), startOfDay(new Date()));
}

/** Build an inclusive list of selectable ISO dates from today up to windowDays. */
export function bookingWindow(windowDays: number): string[] {
  const days = Math.max(1, windowDays || 14);
  const start = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => toISODate(addDays(start, i)));
}

export { addDays, format, isSameDay, startOfDay };
