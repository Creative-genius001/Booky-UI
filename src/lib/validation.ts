import { z } from "zod";

// ---- Customer booking ----
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
});
export type CustomerForm = z.infer<typeof customerSchema>;

// ---- Auth (owners only; backend signup requires email, phone, password) ----
export const signupSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20, "Phone number is too long")
      .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignupForm = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().default(true),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});
export type ForgotForm = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetForm = z.infer<typeof resetSchema>;

// ---- Onboarding / shop ----
export const createShopSchema = z.object({
  name: z.string().trim().min(2, "Shop name is required").max(150),
  slug: z
    .string()
    .trim()
    .max(180)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens")
    .optional(),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(40, "Phone number is too long"),
  timezone: z.string().trim().min(1, "Select a timezone"),
  address: z.string().trim().max(255).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logo_url: z.string().trim().max(500).optional(),
  cover_image_url: z.string().trim().max(500).optional(),
});
export type CreateShopForm = z.infer<typeof createShopSchema>;

// Capacity & appointment length (PATCH /shops/:id). barbing_duration is capped
// at 120 minutes by the backend.
export const capacityConfigSchema = z.object({
  capacity_per_slot: z.coerce.number().int().min(1, "At least 1").max(100),
  barbing_duration: z.coerce
    .number()
    .int()
    .min(1, "At least 1 minute")
    .max(120, "Max 120 minutes"),
});
export type CapacityConfigForm = z.infer<typeof capacityConfigSchema>;

// Uniform weekly schedule (POST /shops/:id/business-days).
export const scheduleSchema = z
  .object({
    open_time: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
    close_time: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
    active_days: z.array(z.number().int().min(0).max(6)),
  })
  .refine((d) => d.close_time > d.open_time, {
    message: "Closing time must be after opening time",
    path: ["close_time"],
  })
  .refine((d) => d.active_days.length > 0, {
    message: "Select at least one open day",
    path: ["active_days"],
  });
export type ScheduleForm = z.infer<typeof scheduleSchema>;

// ---- Services (price in Naira; barbing_duration maps to duration_in_minutes) ----
export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Service name is required").max(150),
  description: z.string().trim().max(255).optional(),
  price: z.coerce.number().int().min(0, "Enter a price").max(10_000_000),
  barbing_duration: z.coerce
    .number()
    .int()
    .min(1, "At least 1 minute")
    .max(120, "Max 120 minutes"),
});
export type ServiceForm = z.infer<typeof serviceSchema>;
