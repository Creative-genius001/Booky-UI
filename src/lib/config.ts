export const config = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, ""),
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Public Mapbox token; when empty the app degrades to a list-only experience. */
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
} as const;

/** Common IANA timezones offered during shop setup (backend validates against tzdata). */
export const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "UTC",
  "Europe/London",
  "America/New_York",
] as const;

export const WEEKDAYS = [
  { key: 0, short: "Sun", long: "Sunday" },
  { key: 1, short: "Mon", long: "Monday" },
  { key: 2, short: "Tue", long: "Tuesday" },
  { key: 3, short: "Wed", long: "Wednesday" },
  { key: 4, short: "Thu", long: "Thursday" },
  { key: 5, short: "Fri", long: "Friday" },
  { key: 6, short: "Sat", long: "Saturday" },
] as const;
