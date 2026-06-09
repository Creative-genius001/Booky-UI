"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { errorMessage } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [verified, setVerified] = useState(false);
  const verifiedOnce = useRef(false);

  const verify = useMutation({
    mutationFn: (t: string) => authApi.verifyEmail(t),
    onSuccess: () => {
      setVerified(true);
      if (user) setUser({ ...user, email_verified: true });
      toast.success("Email verified!");
      setTimeout(
        () => router.push(isAuthenticated ? "/onboarding/shop" : "/login"),
        1200,
      );
    },
    onError: (e) => toast.error(errorMessage(e, "Verification link is invalid")),
  });

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(user?.email ?? ""),
    onSuccess: () => toast.success("Verification email sent"),
    onError: (e) => toast.error(errorMessage(e, "Could not resend email")),
  });

  // Auto-verify when arriving from the email link.
  useEffect(() => {
    if (token && !verifiedOnce.current) {
      verifiedOnce.current = true;
      verify.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---- Token flow (from the email link) ----
  if (token) {
    return (
      <div className="text-center">
        {verify.isPending && (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/20">
              <Spinner className="size-7 text-accent-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Verifying your email…</h1>
          </>
        )}
        {verified && (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">Taking you along…</p>
          </>
        )}
        {verify.isError && (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/15">
              <XCircle className="size-8 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              That verification link is invalid or has expired.
            </p>
            {user?.email && (
              <Button
                className="mt-6"
                onClick={() => resend.mutate()}
                loading={resend.isPending}
              >
                Resend verification email
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // ---- Post-signup "check your inbox" state ----
  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="size-8 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Check your inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">
          {user?.email ?? "your email"}
        </span>
        . Click it to confirm your account.
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full"
        onClick={() => resend.mutate()}
        loading={resend.isPending}
        disabled={!user?.email}
      >
        Resend email
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link
          href="/onboarding/shop"
          className="font-semibold text-primary hover:underline"
        >
          Continue to setup
        </Link>{" "}
        — you can verify later.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
