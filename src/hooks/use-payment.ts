"use client";

import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import type { PaymentInitRequest } from "@/types";
import { errorMessage } from "@/hooks/use-auth";
import { toast } from "sonner";

export function useInitPayment() {
  return useMutation({
    mutationFn: (payload: PaymentInitRequest) => paymentsApi.init(payload),
    onError: (e) =>
      toast.error(errorMessage(e, "Could not start payment. Please try again.")),
  });
}
