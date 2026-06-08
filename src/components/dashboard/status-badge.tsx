import { Badge } from "@/components/ui/badge";
import type { BookingStatus, PaymentStatus } from "@/types";

const BOOKING_MAP: Record<
  BookingStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  no_show: { label: "No show", variant: "muted" },
};

const PAYMENT_MAP: Record<
  PaymentStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "Unpaid", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "muted" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const c = BOOKING_MAP[status] ?? BOOKING_MAP.pending;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const c = PAYMENT_MAP[status] ?? PAYMENT_MAP.pending;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
