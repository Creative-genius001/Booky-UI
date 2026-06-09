"use client";

import { useMutation } from "@tanstack/react-query";
import { paymentsApi, type PaymentInitPayload } from "@/lib/api/payments";
import { errorMessage } from "@/hooks/use-auth";
import { toast } from "sonner";

export function useInitPayment() {
  return useMutation({
    mutationFn: (payload: PaymentInitPayload) => paymentsApi.init(payload),
    onError: (e) =>
      toast.error(errorMessage(e, "Could not start payment. Please try again.")),
  });
}
