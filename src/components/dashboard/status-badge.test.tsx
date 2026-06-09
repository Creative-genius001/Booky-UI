import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";

describe("BookingStatusBadge", () => {
  it("renders a label for each status", () => {
    const { rerender } = render(<BookingStatusBadge status="confirmed" />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();

    rerender(<BookingStatusBadge status="pending_payment" />);
    expect(screen.getByText("Pending payment")).toBeInTheDocument();

    rerender(<BookingStatusBadge status="expired" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });
});

describe("PaymentStatusBadge", () => {
  it("maps payment statuses to friendly labels", () => {
    const { rerender } = render(<PaymentStatusBadge status="success" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();

    rerender(<PaymentStatusBadge status="pending" />);
    expect(screen.getByText("Unpaid")).toBeInTheDocument();
  });
});
