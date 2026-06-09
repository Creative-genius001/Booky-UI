import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toISODate,
  todayISO,
  friendlyDate,
  isPastDate,
  bookingWindow,
  isoClock,
  isoDatePart,
} from "@/lib/dates";

describe("dates", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Pin "now" to a fixed local date for deterministic assertions.
    vi.setSystemTime(new Date(2026, 5, 7, 12, 0, 0)); // 7 Jun 2026, local
  });
  afterEach(() => vi.useRealTimers());

  it("toISODate formats local date as YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 5, 7))).toBe("2026-06-07");
  });

  it("todayISO returns today's local date", () => {
    expect(todayISO()).toBe("2026-06-07");
  });

  it("friendlyDate labels today and tomorrow", () => {
    expect(friendlyDate("2026-06-07")).toBe("Today");
    expect(friendlyDate("2026-06-08")).toBe("Tomorrow");
    expect(friendlyDate("2026-06-10")).toMatch(/Wed, 10 Jun/);
  });

  it("isPastDate detects past dates only", () => {
    expect(isPastDate("2026-06-06")).toBe(true);
    expect(isPastDate("2026-06-07")).toBe(false);
    expect(isPastDate("2026-06-08")).toBe(false);
  });

  it("bookingWindow returns N days starting today", () => {
    const win = bookingWindow(5);
    expect(win).toHaveLength(5);
    expect(win[0]).toBe("2026-06-07");
    expect(win[4]).toBe("2026-06-11");
  });

  it("bookingWindow falls back to a sane default", () => {
    expect(bookingWindow(0)).toHaveLength(14);
  });

  it("isoClock extracts shop-local HH:mm without timezone conversion", () => {
    expect(isoClock("2026-06-10T09:00:00+01:00")).toBe("09:00");
    expect(isoClock("2026-06-10T14:30:00Z")).toBe("14:30");
    expect(isoClock("not-a-date")).toBe("");
  });

  it("isoDatePart extracts the date portion", () => {
    expect(isoDatePart("2026-06-10T09:00:00+01:00")).toBe("2026-06-10");
  });
});
