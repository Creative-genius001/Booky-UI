import { describe, it, expect } from "vitest";
import {
  customerSchema,
  signupSchema,
  serviceSchema,
  bookingConfigSchema,
} from "@/lib/validation";

describe("customerSchema", () => {
  it("accepts valid customer details", () => {
    const r = customerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 800 000 0000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects bad email and short name", () => {
    const r = customerSchema.safeParse({
      name: "J",
      email: "not-an-email",
      phone: "+2348000000000",
    });
    expect(r.success).toBe(false);
  });

  it("rejects phone with letters", () => {
    const r = customerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "callme",
    });
    expect(r.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("fails when passwords don't match", () => {
    const r = signupSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "supersecret",
      confirmPassword: "different",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true,
      );
    }
  });

  it("enforces minimum password length", () => {
    const r = signupSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(r.success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("coerces numeric strings (form inputs)", () => {
    const r = serviceSchema.safeParse({
      name: "Skin Fade",
      durationMinutes: "45",
      priceNaira: "5000",
      isActive: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.durationMinutes).toBe(45);
      expect(r.data.priceNaira).toBe(5000);
    }
  });

  it("rejects too-short duration", () => {
    const r = serviceSchema.safeParse({
      name: "Quick",
      durationMinutes: "2",
      priceNaira: "1000",
      isActive: true,
    });
    expect(r.success).toBe(false);
  });
});

describe("bookingConfigSchema", () => {
  it("requires capacity >= 1", () => {
    expect(
      bookingConfigSchema.safeParse({
        capacity: "0",
        bookingWindowDays: "14",
        slotIntervalMinutes: "30",
        bufferMinutes: "0",
        cancellationHours: "2",
      }).success,
    ).toBe(false);
  });
});
