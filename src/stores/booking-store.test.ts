import { describe, it, expect, beforeEach } from "vitest";
import { useBookingStore } from "@/stores/booking-store";
import { mockServices, mockShop } from "@/test/fixtures";

function reset() {
  useBookingStore.setState({
    shopSlug: null,
    shop: null,
    service: null,
    date: null,
    startTime: null,
    customer: { name: "", email: "", phone: "" },
    notes: "",
  });
}

describe("booking-store", () => {
  beforeEach(() => reset());

  it("starts at the service step", () => {
    expect(useBookingStore.getState().furthestStep()).toBe("service");
  });

  it("advances furthestStep as data is filled", () => {
    const s = () => useBookingStore.getState();
    s().selectService(mockServices[0]);
    expect(s().furthestStep()).toBe("date");

    s().selectDate("2026-06-10");
    expect(s().furthestStep()).toBe("time");

    s().selectTime("09:30");
    expect(s().furthestStep()).toBe("details");

    s().setCustomer({ name: "John", email: "j@x.com", phone: "123456789" });
    expect(s().furthestStep()).toBe("payment");
  });

  it("selecting a service clears any chosen date and time", () => {
    const s = () => useBookingStore.getState();
    s().selectService(mockServices[0]);
    s().selectDate("2026-06-10");
    s().selectTime("09:30");

    s().selectService(mockServices[1]);
    expect(s().date).toBeNull();
    expect(s().startTime).toBeNull();
  });

  it("selecting a new date clears the chosen time", () => {
    const s = () => useBookingStore.getState();
    s().selectDate("2026-06-10");
    s().selectTime("09:30");
    s().selectDate("2026-06-11");
    expect(s().startTime).toBeNull();
  });

  it("switching to a different shop resets all selections", () => {
    const s = () => useBookingStore.getState();
    s().setShop("demo-shop", mockShop);
    s().selectService(mockServices[0]);
    s().selectDate("2026-06-10");

    s().setShop("other-shop", { ...mockShop, slug: "other-shop" });
    expect(s().service).toBeNull();
    expect(s().date).toBeNull();
    expect(s().shopSlug).toBe("other-shop");
  });

  it("keeps selections when re-setting the same shop", () => {
    const s = () => useBookingStore.getState();
    s().setShop("demo-shop", mockShop);
    s().selectService(mockServices[0]);
    s().setShop("demo-shop", mockShop);
    expect(s().service).not.toBeNull();
  });
});
