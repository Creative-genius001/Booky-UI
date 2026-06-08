"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Bell, Crown, Store, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useUpdateShop } from "@/hooks/use-shop-admin";
import {
  createShopSchema,
  bookingConfigSchema,
  type CreateShopForm,
  type BookingConfigForm,
} from "@/lib/validation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Shop } from "@/types";

export default function SettingsPage() {
  const { shop, shopId, isLoading } = useActiveShop();

  if (isLoading || !shop || !shopId) {
    return (
      <div>
        <PageHeader title="Settings" description="Manage your shop and account." />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your shop and account." />
      <div className="space-y-6">
        <ShopInfoSection shop={shop} shopId={shopId} />
        <BookingRulesSection shop={shop} shopId={shopId} />
        <PaystackSection shop={shop} />
        <NotificationSection />
        <SubscriptionSection />
      </div>
    </div>
  );
}

function SectionShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ShopInfoSection({ shop, shopId }: { shop: Shop; shopId: string }) {
  const update = useUpdateShop(shopId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateShopForm>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: shop.name,
      slug: shop.slug,
      phone: shop.phone ?? "",
      address: shop.address ?? "",
      description: shop.description ?? "",
      logoUrl: shop.logoUrl ?? "",
      coverImageUrl: shop.coverImageUrl ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: shop.name,
      slug: shop.slug,
      phone: shop.phone ?? "",
      address: shop.address ?? "",
      description: shop.description ?? "",
      logoUrl: shop.logoUrl ?? "",
      coverImageUrl: shop.coverImageUrl ?? "",
    });
  }, [shop, reset]);

  return (
    <SectionShell
      icon={Store}
      title="Shop information"
      description="What customers see on your booking page."
    >
      <form
        onSubmit={handleSubmit((v) =>
          update.mutate({
            name: v.name,
            slug: v.slug,
            phone: v.phone || undefined,
            address: v.address || undefined,
            description: v.description || undefined,
            logoUrl: v.logoUrl || undefined,
            coverImageUrl: v.coverImageUrl || undefined,
          }),
        )}
        className="space-y-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Shop name" htmlFor="s-name" error={errors.name?.message}>
            <Input id="s-name" invalid={!!errors.name} {...register("name")} />
          </FormField>
          <FormField label="Booking slug" htmlFor="s-slug" error={errors.slug?.message}>
            <Input id="s-slug" invalid={!!errors.slug} {...register("slug")} />
          </FormField>
          <FormField label="Phone" htmlFor="s-phone" error={errors.phone?.message}>
            <Input id="s-phone" {...register("phone")} />
          </FormField>
          <FormField label="Address" htmlFor="s-address" error={errors.address?.message}>
            <Input id="s-address" {...register("address")} />
          </FormField>
        </div>
        <FormField label="Description" htmlFor="s-desc" error={errors.description?.message}>
          <Textarea id="s-desc" {...register("description")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Logo URL" htmlFor="s-logo" error={errors.logoUrl?.message}>
            <Input id="s-logo" {...register("logoUrl")} />
          </FormField>
          <FormField label="Cover image URL" htmlFor="s-cover" error={errors.coverImageUrl?.message}>
            <Input id="s-cover" {...register("coverImageUrl")} />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </SectionShell>
  );
}

function BookingRulesSection({ shop, shopId }: { shop: Shop; shopId: string }) {
  const update = useUpdateShop(shopId);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BookingConfigForm>({
    resolver: zodResolver(bookingConfigSchema),
    defaultValues: {
      capacity: shop.capacity,
      bookingWindowDays: shop.bookingWindowDays,
      slotIntervalMinutes: shop.slotIntervalMinutes,
      bufferMinutes: shop.bufferMinutes,
      cancellationHours: shop.cancellationHours,
    },
  });

  const fields: { name: keyof BookingConfigForm; label: string; suffix: string }[] = [
    { name: "capacity", label: "Capacity", suffix: "people" },
    { name: "bookingWindowDays", label: "Booking window", suffix: "days" },
    { name: "slotIntervalMinutes", label: "Slot interval", suffix: "min" },
    { name: "bufferMinutes", label: "Buffer", suffix: "min" },
    { name: "cancellationHours", label: "Cancellation notice", suffix: "hrs" },
  ];

  return (
    <SectionShell
      icon={SlidersHorizontal}
      title="Booking & capacity rules"
      description="Control how and when customers can book."
    >
      <form
        onSubmit={handleSubmit((v) => update.mutate(v))}
        className="space-y-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => (
            <FormField
              key={f.name}
              label={f.label}
              htmlFor={`br-${f.name}`}
              error={errors[f.name]?.message}
            >
              <Input
                id={`br-${f.name}`}
                type="number"
                inputMode="numeric"
                invalid={!!errors[f.name]}
                rightSlot={
                  <span className="pr-2 text-xs text-muted-foreground">
                    {f.suffix}
                  </span>
                }
                {...register(f.name)}
              />
            </FormField>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </SectionShell>
  );
}

function PaystackSection({ shop }: { shop: Shop }) {
  return (
    <SectionShell
      icon={CreditCard}
      title="Payments (Paystack)"
      description="Collect payments securely before each booking is confirmed."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm">Connection status</span>
          {shop.paystackConnected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="warning">Not connected</Badge>
          )}
        </div>
        <Button
          variant={shop.paystackConnected ? "outline" : "default"}
          onClick={() =>
            toast.info("Connect Paystack from your backend dashboard configuration.")
          }
        >
          {shop.paystackConnected ? "Manage" : "Connect Paystack"}
        </Button>
      </div>
    </SectionShell>
  );
}

function NotificationSection() {
  const items = [
    { id: "new-booking", label: "New booking received", defaultOn: true },
    { id: "cancellation", label: "Booking cancelled", defaultOn: true },
    { id: "daily-summary", label: "Daily summary email", defaultOn: false },
  ];
  return (
    <SectionShell
      icon={Bell}
      title="Notifications"
      description="Choose what we email you about."
    >
      <div className="divide-y divide-border">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-3">
            <span className="text-sm">{it.label}</span>
            <Switch
              defaultChecked={it.defaultOn}
              onCheckedChange={() => toast.success("Notification preference saved")}
            />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function SubscriptionSection() {
  return (
    <SectionShell
      icon={Crown}
      title="Subscription"
      description="Your Bookly plan and billing."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Starter</span>
            <Badge variant="accent">Current plan</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlimited bookings · capacity-based scheduling · Paystack payments
          </p>
        </div>
        <Button variant="outline" onClick={() => toast.info("Billing coming soon")}>
          Manage plan
        </Button>
      </div>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground">
        Need a custom plan for multiple locations?{" "}
        <span className="font-medium text-foreground">Contact sales.</span>
      </p>
    </SectionShell>
  );
}
