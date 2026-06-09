"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Link2, Mail, Phone } from "lucide-react";
import { createShopSchema, type CreateShopForm } from "@/lib/validation";
import { useCreateShop } from "@/hooks/use-shop-admin";
import { useShopStore } from "@/stores/shop-store";
import { config, TIMEZONES } from "@/lib/config";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

export default function OnboardingShopPage() {
  const router = useRouter();
  const createShop = useCreateShop();
  const setActiveShop = useShopStore((s) => s.setActiveShop);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<CreateShopForm>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      timezone: "Africa/Lagos",
    },
  });

  const slug = watch("slug");
  const timezone = watch("timezone");
  const address = watch("address");

  function onName(e: React.ChangeEvent<HTMLInputElement>) {
    if (!dirtyFields.slug) setValue("slug", slugify(e.target.value));
  }

  function submit(values: CreateShopForm) {
    createShop.mutate(
      {
        name: values.name,
        slug: values.slug || undefined,
        email: values.email,
        phone: values.phone,
        timezone: values.timezone,
        address: values.address || undefined,
        latitude: values.latitude,
        longitude: values.longitude,
      },
      {
        onSuccess: (shop) => {
          setActiveShop(shop.id, shop.slug);
          router.push("/onboarding/booking-config");
        },
      },
    );
  }

  return (
    <div>
      <OnboardingProgress current={1} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your shop</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This is what customers see when they open your booking link.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FormField
          label="Shop name"
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Kingsway Cuts"
            invalid={!!errors.name}
            {...register("name", { onChange: onName })}
          />
        </FormField>

        <FormField
          label="Booking link"
          htmlFor="slug"
          error={errors.slug?.message}
          hint={
            !errors.slug
              ? `${config.appUrl.replace(/^https?:\/\//, "")}/book/${slug || "your-shop"}`
              : undefined
          }
        >
          <Input
            id="slug"
            placeholder="kingsway-cuts"
            leftIcon={<Link2 />}
            invalid={!!errors.slug}
            {...register("slug")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="shop@example.com"
              leftIcon={<Mail />}
              invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone" required error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              leftIcon={<Phone />}
              invalid={!!errors.phone}
              {...register("phone")}
            />
          </FormField>
        </div>

        <FormField
          label="Address"
          htmlFor="address"
          error={errors.address?.message}
          hint="Helps customers find you on the map. Pick a suggestion to set your location."
        >
          <AddressAutocomplete
            id="address"
            value={address ?? ""}
            invalid={!!errors.address}
            placeholder="12 Marina Rd, Lagos"
            onChange={(v) => setValue("address", v)}
            onSelect={({ address: a, latitude, longitude }) => {
              setValue("address", a);
              setValue("latitude", latitude);
              setValue("longitude", longitude);
            }}
          />
        </FormField>

        <FormField
          label="Timezone"
          htmlFor="timezone"
          required
          error={errors.timezone?.message}
          hint="Used to schedule slots and business hours."
        >
          <Select
            value={timezone}
            onValueChange={(v) => setValue("timezone", v, { shouldValidate: true })}
          >
            <SelectTrigger id="timezone" invalid={!!errors.timezone}>
              <SelectValue placeholder="Select a timezone" />
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

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={createShop.isPending}
        >
          Continue <ArrowRight className="size-4" />
        </Button>
      </form>
    </div>
  );
}
