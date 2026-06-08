"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { forgotSchema, type ForgotForm } from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const forgot = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    // Always show success to avoid leaking which emails exist.
    onSettled: (_d, _e, email) => setSentTo(email),
  });

  if (sentTo) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-8 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{sentTo}</span>, we've
          sent a link to reset your password.
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => forgot.mutate(v.email))}
        className="space-y-4"
        noValidate
      >
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

        <Button type="submit" className="w-full" loading={forgot.isPending}>
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to login
      </Link>
    </div>
  );
}
