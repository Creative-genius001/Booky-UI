"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { resetSchema, type ResetForm } from "@/lib/validation";
import { errorMessage } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const reset = useMutation({
    mutationFn: (v: ResetForm) =>
      authApi.resetPassword(token as string, v.password),
    onSuccess: () => {
      toast.success("Password updated. Please log in.");
      router.push("/login");
    },
    onError: (e) => toast.error(errorMessage(e, "Reset link is invalid")),
  });

  if (!token) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Invalid link</h1>
        <Alert variant="destructive" title="Missing reset token">
          This password reset link is incomplete or has expired.
        </Alert>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password you don't use elsewhere.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => reset.mutate(v))}
        className="space-y-4"
        noValidate
      >
        <FormField
          label="New password"
          htmlFor="password"
          error={errors.password?.message}
          hint={!errors.password ? "At least 8 characters." : undefined}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="New password"
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

        <Button type="submit" className="w-full" loading={reset.isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
