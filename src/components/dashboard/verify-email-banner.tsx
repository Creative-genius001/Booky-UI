"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { errorMessage } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

/** Shown in the dashboard until the owner verifies their email. */
export function VerifyEmailBanner() {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(user?.email ?? ""),
    onSuccess: () => toast.success("Verification email sent"),
    onError: (e) => toast.error(errorMessage(e, "Could not resend email")),
  });

  // Only show once we actually know the user is unverified.
  if (!user || user.email_verified || dismissed) return null;

  return (
    <div className="flex flex-col gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:px-6">
      <div className="flex flex-1 items-center gap-2">
        <MailWarning className="size-4 shrink-0 text-warning-foreground" />
        <span>
          Verify your email to secure your account. Check{" "}
          <span className="font-medium">{user.email}</span>.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-card"
          onClick={() => resend.mutate()}
          loading={resend.isPending}
        >
          Resend email
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
