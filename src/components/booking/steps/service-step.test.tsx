import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/server";
import { ServiceStep } from "@/components/booking/steps/service-step";
import { useBookingStore } from "@/stores/booking-store";

function resetStore() {
  useBookingStore.setState({
    service: null,
    date: null,
    startTime: null,
  });
}

describe("ServiceStep", () => {
  beforeEach(() => resetStore());

  it("lists only active services", async () => {
    renderWithProviders(<ServiceStep shopId="shop_1" onNext={() => {}} />);

    expect(await screen.findByText("Skin Fade")).toBeInTheDocument();
    expect(screen.getByText("Beard Trim")).toBeInTheDocument();
    // "Kids Cut" is inactive in fixtures and must be filtered out.
    expect(screen.queryByText("Kids Cut")).not.toBeInTheDocument();
  });

  it("shows formatted prices and durations", async () => {
    renderWithProviders(<ServiceStep shopId="shop_1" onNext={() => {}} />);
    expect(await screen.findByText("₦5,000")).toBeInTheDocument();
    expect(screen.getByText("45m")).toBeInTheDocument();
  });

  it("selects a service and advances", async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ServiceStep shopId="shop_1" onNext={onNext} />);

    await user.click(await screen.findByText("Skin Fade"));

    expect(useBookingStore.getState().service?.name).toBe("Skin Fade");
    await waitFor(() => expect(onNext).toHaveBeenCalled());
  });

  it("renders an empty state when there are no services", async () => {
    server.use(
      http.get("*/shops/:id/services", () => HttpResponse.json([])),
    );
    renderWithProviders(<ServiceStep shopId="shop_1" onNext={() => {}} />);
    expect(
      await screen.findByText(/no services available/i),
    ).toBeInTheDocument();
  });

  it("renders an error state when the request fails", async () => {
    server.use(
      http.get("*/shops/:id/services", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );
    renderWithProviders(<ServiceStep shopId="shop_1" onNext={() => {}} />);
    expect(
      await screen.findByText(/couldn't load services/i),
    ).toBeInTheDocument();
  });
});
