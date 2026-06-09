"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/require-auth";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { VerifyEmailBanner } from "@/components/dashboard/verify-email-banner";
import { useEnsureShop } from "@/hooks/use-ensure-shop";
import { FullPageSpinner } from "@/components/ui/spinner";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { resolving, hasShop, isEmpty } = useEnsureShop();

  useEffect(() => {
    // Owner has no shop yet → send them through onboarding.
    if (isEmpty) router.replace("/onboarding/shop");
  }, [isEmpty, router]);

  if (resolving) return <FullPageSpinner label="Loading your shop…" />;
  if (!hasShop) return <FullPageSpinner />;

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardGuard>
        <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
          <aside className="sticky top-0 hidden h-dvh border-r border-border bg-card lg:block">
            <SidebarNav />
          </aside>
          <div className="flex min-h-dvh flex-col">
            <Topbar />
            <VerifyEmailBanner />
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </DashboardGuard>
    </RequireAuth>
  );
}
