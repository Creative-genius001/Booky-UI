import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug } = await params;
  const pretty = shopSlug.replace(/-/g, " ");
  return {
    title: `Book at ${pretty}`,
    description: `Book your next appointment at ${pretty} in seconds — pick a service, choose a time and pay securely.`,
  };
}

export default async function BookShopPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  return <BookingFlow slug={shopSlug} />;
}
