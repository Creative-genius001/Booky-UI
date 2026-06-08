"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { signupSchema, type SignupForm } from "@/lib/validation";
import { useSignup } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start taking paid bookings in minutes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) =>
          signup.mutate({
            fullName: v.fullName,
            email: v.email,
            password: v.password,
          }),
        )}
        className="space-y-4"
        noValidate
      >
        <FormField
          label="Full name"
          htmlFor="fullName"
          error={errors.fullName?.message}
        >
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="John Doe"
            leftIcon={<User />}
            invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail />}
            invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint={!errors.password ? "At least 8 characters." : undefined}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a password"
            invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={signup.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
