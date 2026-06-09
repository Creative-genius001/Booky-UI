"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { tokenStore } from "@/lib/api/token-store";
import { FullPageSpinner } from "@/components/ui/spinner";

/**
 * Client-side guard for owner routes. Auth state lives in localStorage (tokens
 * are not readable by middleware), so gating happens on the client.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;
    const hasToken = !!tokenStore.get()?.access_token;
    if (!isAuthenticated || !hasToken) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return <FullPageSpinner />;
  if (!isAuthenticated) return <FullPageSpinner />;

  return <>{children}</>;
}
