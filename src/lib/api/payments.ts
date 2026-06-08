import { api } from "@/lib/api/client";
import type { PaymentInitRequest, PaymentInitResponse } from "@/types";

export const paymentsApi = {
  /** Router: POST /payments/init -> Paystack authorization URL. */
  init: (payload: PaymentInitRequest) =>
    api.post<PaymentInitResponse>("/payments/init", payload, { auth: false }),
};
