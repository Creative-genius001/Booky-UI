import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { DetailsStep } from "@/components/booking/steps/details-step";
import { useBookingStore } from "@/stores/booking-store";

function resetStore() {
  useBookingStore.setState({ customer: { name: "", email: "" } });
}

function renderStep(onValid = vi.fn()) {
  render(<DetailsStep formId="details-form" onValid={onValid} />);
  return { onValid };
}

function submitForm() {
  document
    .getElementById("details-form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("DetailsStep", () => {
  beforeEach(() => resetStore());

  it("blocks submission and shows errors when empty", async () => {
    const { onValid } = renderStep();
    submitForm();
    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("saves details to the store and calls onValid when valid", async () => {
    const user = userEvent.setup();
    const { onValid } = renderStep();

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    submitForm();

    await waitFor(() => expect(onValid).toHaveBeenCalled());
    expect(useBookingStore.getState().customer).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
    });
  });

  it("pre-fills from existing store state", () => {
    useBookingStore.setState({
      customer: { name: "Ada", email: "ada@x.com" },
    });
    renderStep();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ada");
    expect(screen.getByLabelText(/email/i)).toHaveValue("ada@x.com");
  });
});
