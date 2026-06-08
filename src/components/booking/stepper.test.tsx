import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Stepper } from "@/components/booking/stepper";

describe("Stepper", () => {
  it("renders all step labels", () => {
    render(<Stepper current="service" reachableIndex={0} />);
    ["Service", "Date", "Time", "Details", "Payment"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("navigates to a reachable earlier step on click", async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Stepper current="time" reachableIndex={2} onStepClick={onStepClick} />,
    );

    await user.click(screen.getByText("Service"));
    expect(onStepClick).toHaveBeenCalledWith("service");
  });

  it("does not navigate to steps beyond the reachable index", async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Stepper current="service" reachableIndex={0} onStepClick={onStepClick} />,
    );

    // "Payment" is not yet reachable; its button is disabled.
    await user.click(screen.getByText("Payment"));
    expect(onStepClick).not.toHaveBeenCalled();
  });
});
