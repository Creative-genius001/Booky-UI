import { api } from "@/lib/api/client";
import type {
  Bank,
  ShopBankAccount,
  WalletEntriesResult,
  WalletSummary,
  WithdrawalRequest,
  WithdrawalsResult,
} from "@/types";

export const payoutsApi = {
  /** GET /payouts/banks — supported banks for the payout picker. */
  banks: () => api.get<Bank[]>("/payouts/banks"),

  /** GET /shops/:id/bank-account — null when not set. */
  getBankAccount: (shopId: string) =>
    api.get<ShopBankAccount | null>(`/shops/${shopId}/bank-account`),

  /** POST /shops/:id/bank-account — resolves + registers the payout account. */
  saveBankAccount: (shopId: string, bank_code: string, account_number: string) =>
    api.post<ShopBankAccount>(`/shops/${shopId}/bank-account`, {
      bank_code,
      account_number,
    }),

  /** GET /shops/:id/wallet — available balance. */
  wallet: (shopId: string) => api.get<WalletSummary>(`/shops/${shopId}/wallet`),

  /** GET /shops/:id/wallet/entries — paginated ledger. */
  walletEntries: (shopId: string, page = 1, pageSize = 20) =>
    api.get<WalletEntriesResult>(
      `/shops/${shopId}/wallet/entries?page=${page}&page_size=${pageSize}`,
    ),

  /** POST /shops/:id/withdrawals — request a payout. */
  requestWithdrawal: (shopId: string, amount_kobo: number) =>
    api.post<WithdrawalRequest>(`/shops/${shopId}/withdrawals`, { amount_kobo }),

  /** GET /shops/:id/withdrawals — withdrawal history. */
  withdrawals: (shopId: string) =>
    api.get<WithdrawalsResult>(`/shops/${shopId}/withdrawals`),
};
