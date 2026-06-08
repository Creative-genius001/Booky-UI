"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/require-auth";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useShopStore } from "@/stores/shop-store";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const activeShopId = useShopStore((s) => s.activeShopId);

  useEffect(() => {
    // No shop yet → send the owner through onboarding.
    if (activeShopId === null) router.replace("/onboarding/shop");
  }, [activeShopId, router]);

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
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </DashboardGuard>
    </RequireAuth>
  );
}
