import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
  notes: z.string().trim().max(500, "Notes are too long").optional(),
});
export type CustomerForm = z.infer<typeof customerSchema>;

// ---- Auth ----
export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email"),
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
  name: z.string().trim().min(2, "Shop name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(160).optional(),
  description: z.string().trim().max(400).optional(),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  coverImageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
export type CreateShopForm = z.infer<typeof createShopSchema>;

export const bookingConfigSchema = z.object({
  capacity: z.coerce.number().int().min(1, "At least 1").max(100),
  bookingWindowDays: z.coerce.number().int().min(1).max(120),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(240),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
  cancellationHours: z.coerce.number().int().min(0).max(168),
});
export type BookingConfigForm = z.infer<typeof bookingConfigSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Service name is required").max(80),
  description: z.string().trim().max(300).optional(),
  durationMinutes: z.coerce.number().int().min(5, "Min 5 minutes").max(480),
  // Captured in Naira from the UI, converted to kobo before sending.
  priceNaira: z.coerce.number().min(0, "Enter a price").max(10_000_000),
  isActive: z.boolean().default(true),
});
export type ServiceForm = z.infer<typeof serviceSchema>;
