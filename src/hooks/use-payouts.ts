"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { payoutsApi } from "@/lib/api/payouts";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/hooks/use-auth";

export function useBanks(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payouts.banks,
    queryFn: () => payoutsApi.banks(),
    enabled,
    staleTime: 60 * 60_000, // banks rarely change
  });
}

export function useBankAccount(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payouts.bankAccount(shopId ?? ""),
    queryFn: () => payoutsApi.getBankAccount(shopId as string),
    enabled: !!shopId,
  });
}

export function useSaveBankAccount(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankCode, accountNumber }: { bankCode: string; accountNumber: string }) =>
      payoutsApi.saveBankAccount(shopId, bankCode, accountNumber),
    onSuccess: (account) => {
      qc.setQueryData(queryKeys.payouts.bankAccount(shopId), account);
      toast.success("Payout account saved");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not save those bank details")),
  });
}

export function useWallet(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payouts.wallet(shopId ?? ""),
    queryFn: () => payoutsApi.wallet(shopId as string),
    enabled: !!shopId,
  });
}

export function useWalletEntries(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payouts.entries(shopId ?? ""),
    queryFn: () => payoutsApi.walletEntries(shopId as string),
    enabled: !!shopId,
  });
}

export function useWithdrawals(shopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payouts.withdrawals(shopId ?? ""),
    queryFn: () => payoutsApi.withdrawals(shopId as string),
    enabled: !!shopId,
  });
}

export function useRequestWithdrawal(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amountKobo: number) =>
      payoutsApi.requestWithdrawal(shopId, amountKobo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payouts.wallet(shopId) });
      qc.invalidateQueries({ queryKey: queryKeys.payouts.entries(shopId) });
      qc.invalidateQueries({ queryKey: queryKeys.payouts.withdrawals(shopId) });
      toast.success("Withdrawal requested");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not request withdrawal")),
  });
}
