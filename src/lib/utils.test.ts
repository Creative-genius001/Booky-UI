import { describe, it, expect } from "vitest";
import {
  formatKobo,
  formatNaira,
  formatTimeLabel,
  formatDuration,
  getInitials,
} from "@/lib/utils";

describe("formatKobo", () => {
  it("converts kobo to a Naira string with symbol", () => {
    expect(formatKobo(500000)).toBe("₦5,000");
  });
  it("shows decimals only when the amount is fractional", () => {
    expect(formatKobo(150050)).toBe("₦1,500.50");
    expect(formatKobo(100000)).toBe("₦1,000");
  });
  it("handles zero and nullish input", () => {
    expect(formatKobo(0)).toBe("₦0");
    // @ts-expect-error testing defensive nullish handling
    expect(formatKobo(undefined)).toBe("₦0");
  });
  it("can omit the symbol", () => {
    expect(formatKobo(500000, { withSymbol: false })).toBe("5,000");
  });
});

describe("formatNaira", () => {
  it("formats a plain naira amount", () => {
    expect(formatNaira(2500)).toBe("₦2,500");
  });
});

describe("formatTimeLabel", () => {
  it("converts 24h to friendly 12h", () => {
    expect(formatTimeLabel("09:00")).toBe("9:00 AM");
    expect(formatTimeLabel("13:30")).toBe("1:30 PM");
    expect(formatTimeLabel("00:00")).toBe("12:00 AM");
    expect(formatTimeLabel("12:00")).toBe("12:00 PM");
  });
  it("handles HH:mm:ss and empty input", () => {
    expect(formatTimeLabel("14:05:00")).toBe("2:05 PM");
    expect(formatTimeLabel("")).toBe("");
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(0)).toBe("—");
  });
});

describe("getInitials", () => {
  it("takes up to two initials, uppercased", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("madonna")).toBe("M");
    expect(getInitials("  ada lovelace byron ")).toBe("AL");
    expect(getInitials("")).toBe("?");
  });
});
