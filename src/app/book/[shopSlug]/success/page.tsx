import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessView } from "@/components/booking/success-view";
import { FullPageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Booking confirmation",
  robots: { index: false },
};

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ code?: string; reference?: string; trxref?: string }>;
}) {
  const { shopSlug } = await params;
  const sp = await searchParams;
  const code = sp.code;

  return (
    <Suspense fallback={<FullPageSpinner label="Loading your booking…" />}>
      <SuccessView slug={shopSlug} code={code} />
    </Suspense>
  );
}
