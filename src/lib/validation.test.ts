import { describe, it, expect } from "vitest";
import {
  customerSchema,
  signupSchema,
  serviceSchema,
  capacityConfigSchema,
  scheduleSchema,
  createShopSchema,
  forgotSchema,
  resetSchema,
} from "@/lib/validation";

describe("customerSchema", () => {
  it("accepts a valid name and email", () => {
    expect(
      customerSchema.safeParse({ name: "John Doe", email: "john@example.com" })
        .success,
    ).toBe(true);
  });
  it("rejects bad email and short name", () => {
    expect(
      customerSchema.safeParse({ name: "J", email: "nope" }).success,
    ).toBe(false);
  });
});

describe("signupSchema", () => {
  it("requires phone and matching passwords", () => {
    const ok = signupSchema.safeParse({
      email: "jane@example.com",
      phone: "+2348012345678",
      password: "supersecret",
      confirmPassword: "supersecret",
    });
    expect(ok.success).toBe(true);
  });
  it("fails when passwords don't match", () => {
    const r = signupSchema.safeParse({
      email: "jane@example.com",
      phone: "+2348012345678",
      password: "supersecret",
      confirmPassword: "different",
    });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true,
      );
  });
  it("rejects an invalid phone", () => {
    expect(
      signupSchema.safeParse({
        email: "jane@example.com",
        phone: "callme",
        password: "supersecret",
        confirmPassword: "supersecret",
      }).success,
    ).toBe(false);
  });
});

describe("createShopSchema", () => {
  it("requires name, email, phone and timezone", () => {
    expect(
      createShopSchema.safeParse({
        name: "Kingsway Cuts",
        email: "shop@example.com",
        phone: "+2348000000000",
        timezone: "Africa/Lagos",
      }).success,
    ).toBe(true);
  });
  it("rejects an invalid slug", () => {
    expect(
      createShopSchema.safeParse({
        name: "Shop",
        slug: "Has Spaces",
        email: "shop@example.com",
        phone: "+2348000000000",
        timezone: "Africa/Lagos",
      }).success,
    ).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("coerces numeric strings and accepts Naira price", () => {
    const r = serviceSchema.safeParse({
      name: "Skin Fade",
      barbing_duration: "45",
      price: "5000",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.barbing_duration).toBe(45);
      expect(r.data.price).toBe(5000);
    }
  });
  it("caps duration at 120 minutes (backend limit)", () => {
    expect(
      serviceSchema.safeParse({
        name: "Marathon",
        barbing_duration: "200",
        price: "5000",
      }).success,
    ).toBe(false);
  });
});

describe("capacityConfigSchema", () => {
  it("requires capacity >= 1 and duration <= 120", () => {
    expect(
      capacityConfigSchema.safeParse({
        capacity_per_slot: "0",
        barbing_duration: "60",
      }).success,
    ).toBe(false);
    expect(
      capacityConfigSchema.safeParse({
        capacity_per_slot: "3",
        barbing_duration: "60",
      }).success,
    ).toBe(true);
  });
});

describe("forgotSchema / resetSchema", () => {
  it("validates the forgot-password email", () => {
    expect(forgotSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(forgotSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
  it("requires matching 8+ char passwords on reset", () => {
    expect(
      resetSchema.safeParse({ password: "supersecret", confirmPassword: "supersecret" })
        .success,
    ).toBe(true);
    expect(
      resetSchema.safeParse({ password: "short", confirmPassword: "short" }).success,
    ).toBe(false);
    expect(
      resetSchema.safeParse({ password: "supersecret", confirmPassword: "nope" })
        .success,
    ).toBe(false);
  });
});

describe("scheduleSchema", () => {
  it("requires close after open and at least one day", () => {
    expect(
      scheduleSchema.safeParse({
        open_time: "09:00",
        close_time: "18:00",
        active_days: [1, 2, 3],
      }).success,
    ).toBe(true);
    expect(
      scheduleSchema.safeParse({
        open_time: "18:00",
        close_time: "09:00",
        active_days: [1],
      }).success,
    ).toBe(false);
    expect(
      scheduleSchema.safeParse({
        open_time: "09:00",
        close_time: "18:00",
        active_days: [],
      }).success,
    ).toBe(false);
  });
});
