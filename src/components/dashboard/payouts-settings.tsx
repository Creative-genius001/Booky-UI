"use client";

import { useState } from "react";
import { Banknote, Landmark, Wallet } from "lucide-react";
import {
  useBankAccount,
  useBanks,
  useRequestWithdrawal,
  useSaveBankAccount,
  useWallet,
  useWithdrawals,
} from "@/hooks/use-payouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatKobo } from "@/lib/utils";
import { longDate } from "@/lib/dates";
import type { WithdrawalStatus } from "@/types";

const STATUS: Record<WithdrawalStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

export function PayoutsSettings({ shopId }: { shopId: string }) {
  const wallet = useWallet(shopId);
  const account = useBankAccount(shopId);
  const withdrawals = useWithdrawals(shopId);

  const [editing, setEditing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const balance = wallet.data?.balance_kobo ?? 0;
  const hasAccount = !!account.data;
  const showForm = editing || (!account.isLoading && !hasAccount);

  return (
    <div className="space-y-6">
      {/* Balance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </div>
            <div>
              <CardTitle>Available balance</CardTitle>
              <CardDescription>Earnings from confirmed bookings, ready to withdraw.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {wallet.isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{formatKobo(balance)}</p>
          )}
          <Button
            onClick={() => setWithdrawOpen(true)}
            disabled={!hasAccount || balance <= 0}
          >
            <Banknote className="size-4" /> Withdraw
          </Button>
        </CardContent>
      </Card>

      {/* Bank account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </div>
            <div>
              <CardTitle>Payout account</CardTitle>
              <CardDescription>Where your withdrawals are sent.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {account.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : showForm ? (
            <BankAccountForm shopId={shopId} onDone={() => setEditing(false)} />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{account.data?.account_name}</p>
                <p className="text-sm text-muted-foreground">
                  {account.data?.bank_name} ····{" "}
                  {account.data?.account_number.slice(-4)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : withdrawals.data && withdrawals.data.withdrawals.length > 0 ? (
            <div className="divide-y divide-border">
              {withdrawals.data.withdrawals.map((w) => {
                const s = STATUS[w.status] ?? STATUS.pending;
                return (
                  <div key={w.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{formatKobo(w.amount_kobo)}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.created_at ? longDate(w.created_at) : ""} ·{" "}
                        <span className="font-mono">{w.reference}</span>
                      </p>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No withdrawals yet.
            </p>
          )}
        </CardContent>
      </Card>

      <WithdrawDialog
        shopId={shopId}
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        maxKobo={balance}
      />
    </div>
  );
}

function BankAccountForm({ shopId, onDone }: { shopId: string; onDone: () => void }) {
  const banks = useBanks();
  const save = useSaveBankAccount(shopId);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const valid = bankCode && /^\d{10}$/.test(accountNumber);

  return (
    <div className="space-y-4">
      <FormField label="Bank" htmlFor="bank">
        <Select value={bankCode} onValueChange={setBankCode}>
          <SelectTrigger id="bank">
            <SelectValue placeholder={banks.isLoading ? "Loading banks…" : "Select your bank"} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {(banks.data ?? []).map((b) => (
              <SelectItem key={`${b.code}-${b.slug ?? b.name}`} value={b.code}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Account number"
        htmlFor="account-number"
        hint="10-digit NUBAN. We'll verify the account name with your bank."
      >
        <Input
          id="account-number"
          inputMode="numeric"
          maxLength={10}
          placeholder="0123456789"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button
          disabled={!valid}
          loading={save.isPending}
          onClick={() =>
            save.mutate({ bankCode, accountNumber }, { onSuccess: onDone })
          }
        >
          Verify & save
        </Button>
      </div>
    </div>
  );
}

function WithdrawDialog({
  shopId,
  open,
  onOpenChange,
  maxKobo,
}: {
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxKobo: number;
}) {
  const request = useRequestWithdrawal(shopId);
  const [naira, setNaira] = useState("");

  const amountKobo = Math.round((Number(naira) || 0) * 100);
  const valid = amountKobo > 0 && amountKobo <= maxKobo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Withdraw funds</DialogTitle>
          <DialogDescription>
            Available: {formatKobo(maxKobo)}. Paid to your saved bank account.
          </DialogDescription>
        </DialogHeader>
        <FormField label="Amount (₦)" htmlFor="amount">
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0"
            value={naira}
            leftIcon={<span className="text-sm">₦</span>}
            onChange={(e) => setNaira(e.target.value.replace(/[^\d.]/g, ""))}
          />
        </FormField>
        <Separator />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            loading={request.isPending}
            onClick={() =>
              request.mutate(amountKobo, {
                onSuccess: () => {
                  onOpenChange(false);
                  setNaira("");
                },
              })
            }
          >
            Withdraw {valid ? formatKobo(amountKobo) : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
