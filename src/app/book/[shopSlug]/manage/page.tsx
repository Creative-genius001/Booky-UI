import type { Metadata } from "next";
import { Suspense } from "react";
import { ManageBooking } from "@/components/booking/manage-booking";
import { FullPageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Manage booking",
  robots: { index: false },
};

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { shopSlug } = await params;
  const { code } = await searchParams;

  return (
    <Suspense fallback={<FullPageSpinner label="Loading your booking…" />}>
      <ManageBooking slug={shopSlug} code={code} />
    </Suspense>
  );
}
