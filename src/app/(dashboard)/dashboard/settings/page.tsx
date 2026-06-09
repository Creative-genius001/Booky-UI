"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Store, SlidersHorizontal, Power } from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useUpdateShop } from "@/hooks/use-shop-admin";
import {
  createShopSchema,
  capacityConfigSchema,
  type CreateShopForm,
  type CapacityConfigForm,
} from "@/lib/validation";
import { TIMEZONES } from "@/lib/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { ImageUpload } from "@/components/ui/image-upload";
import { PayoutsSettings } from "@/components/dashboard/payouts-settings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Shop } from "@/types";

export default function SettingsPage() {
  const { shop, shopId, shopSlug, isLoading } = useActiveShop();

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
        <ShopInfoSection shop={shop} shopId={shopId} slug={shopSlug ?? undefined} />
        <CapacitySection shop={shop} shopId={shopId} slug={shopSlug ?? undefined} />
        <ActiveSection shop={shop} shopId={shopId} slug={shopSlug ?? undefined} />
        <PaystackSection />

        <div className="pt-2">
          <h2 className="mb-1 text-lg font-bold tracking-tight">Payouts</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Withdraw your earnings to your bank account.
          </p>
          <PayoutsSettings shopId={shopId} />
        </div>
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

function ShopInfoSection({
  shop,
  shopId,
  slug,
}: {
  shop: Shop;
  shopId: string;
  slug?: string;
}) {
  const update = useUpdateShop(shopId, slug);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateShopForm>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: shop.name,
      slug: shop.slug,
      email: shop.email,
      phone: shop.phone,
      timezone: shop.timezone,
      address: shop.address ?? "",
      latitude: shop.latitude ?? undefined,
      longitude: shop.longitude ?? undefined,
      logo_url: shop.logo_url ?? "",
      cover_image_url: shop.cover_image_url ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: shop.name,
      slug: shop.slug,
      email: shop.email,
      phone: shop.phone,
      timezone: shop.timezone,
      address: shop.address ?? "",
      latitude: shop.latitude ?? undefined,
      longitude: shop.longitude ?? undefined,
      logo_url: shop.logo_url ?? "",
      cover_image_url: shop.cover_image_url ?? "",
    });
  }, [shop, reset]);

  const timezone = watch("timezone");
  const address = watch("address");
  const logoUrl = watch("logo_url");
  const coverUrl = watch("cover_image_url");

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
            slug: v.slug || undefined,
            email: v.email,
            phone: v.phone,
            timezone: v.timezone,
            address: v.address || undefined,
            latitude: v.latitude,
            longitude: v.longitude,
            logo_url: v.logo_url || undefined,
            cover_image_url: v.cover_image_url || undefined,
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
          <FormField label="Email" htmlFor="s-email" error={errors.email?.message}>
            <Input id="s-email" type="email" invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Phone" htmlFor="s-phone" error={errors.phone?.message}>
            <Input id="s-phone" {...register("phone")} />
          </FormField>
        </div>
        <FormField label="Timezone" htmlFor="s-tz" error={errors.timezone?.message}>
          <Select
            value={timezone}
            onValueChange={(v) => setValue("timezone", v, { shouldDirty: true })}
          >
            <SelectTrigger id="s-tz">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Address"
          htmlFor="s-address"
          error={errors.address?.message}
          hint="Pick a suggestion to place your shop on the discovery map."
        >
          <AddressAutocomplete
            id="s-address"
            value={address ?? ""}
            onChange={(v) => setValue("address", v, { shouldDirty: true })}
            onSelect={({ address: a, latitude, longitude }) => {
              setValue("address", a, { shouldDirty: true });
              setValue("latitude", latitude, { shouldDirty: true });
              setValue("longitude", longitude, { shouldDirty: true });
            }}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <FormField label="Logo">
            <ImageUpload
              shape="square"
              value={logoUrl || undefined}
              onChange={(url) => setValue("logo_url", url, { shouldDirty: true })}
              label="Upload logo"
            />
          </FormField>
          <FormField label="Cover image">
            <ImageUpload
              shape="wide"
              value={coverUrl || undefined}
              onChange={(url) =>
                setValue("cover_image_url", url, { shouldDirty: true })
              }
              label="Upload cover"
            />
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

function CapacitySection({
  shop,
  shopId,
  slug,
}: {
  shop: Shop;
  shopId: string;
  slug?: string;
}) {
  const update = useUpdateShop(shopId, slug);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CapacityConfigForm>({
    resolver: zodResolver(capacityConfigSchema),
    defaultValues: {
      capacity_per_slot: shop.capacity_per_slot,
      barbing_duration: shop.barbing_duration,
    },
  });

  return (
    <SectionShell
      icon={SlidersHorizontal}
      title="Capacity & timing"
      description="How many customers you serve at once and how long an appointment takes."
    >
      <form
        onSubmit={handleSubmit((v) => update.mutate(v))}
        className="space-y-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Capacity per slot"
            htmlFor="cap"
            error={errors.capacity_per_slot?.message}
          >
            <Input
              id="cap"
              type="number"
              inputMode="numeric"
              invalid={!!errors.capacity_per_slot}
              rightSlot={
                <span className="pr-2 text-xs text-muted-foreground">people</span>
              }
              {...register("capacity_per_slot")}
            />
          </FormField>
          <FormField
            label="Appointment length"
            htmlFor="dur"
            error={errors.barbing_duration?.message}
          >
            <Input
              id="dur"
              type="number"
              inputMode="numeric"
              invalid={!!errors.barbing_duration}
              rightSlot={
                <span className="pr-2 text-xs text-muted-foreground">min</span>
              }
              {...register("barbing_duration")}
            />
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

function ActiveSection({
  shop,
  shopId,
  slug,
}: {
  shop: Shop;
  shopId: string;
  slug?: string;
}) {
  const update = useUpdateShop(shopId, slug);
  return (
    <SectionShell
      icon={Power}
      title="Shop visibility"
      description="Temporarily stop taking new bookings without losing your setup."
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Accepting bookings</p>
          <p className="text-xs text-muted-foreground">
            When off, your booking page is inactive.
          </p>
        </div>
        <Switch
          checked={shop.is_active}
          disabled={update.isPending}
          onCheckedChange={(v) => update.mutate({ is_active: v })}
        />
      </div>
    </SectionShell>
  );
}

function PaystackSection() {
  return (
    <SectionShell
      icon={CreditCard}
      title="Payments"
      description="Payments are processed by Paystack before each booking is confirmed."
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Paystack is configured on the backend server.
        </span>
        <Badge variant="success">Enabled</Badge>
      </div>
    </SectionShell>
  );
}
