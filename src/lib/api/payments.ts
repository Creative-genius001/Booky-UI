import { api } from "@/lib/api/client";
import type { InitiateResult } from "@/types";

export interface PaymentInitPayload {
  booking_code: string;
  payment_reference: string;
}

export const paymentsApi = {
  /**
   * POST /payments/init — re-initialises payment for an existing pending
   * booking and returns a fresh Paystack authorization URL.
   */
  init: (payload: PaymentInitPayload) =>
    api.post<InitiateResult>("/payments/init", payload, { auth: false }),
};
