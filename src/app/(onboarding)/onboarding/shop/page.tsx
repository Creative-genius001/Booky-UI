"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Link2 } from "lucide-react";
import { createShopSchema, type CreateShopForm } from "@/lib/validation";
import { useCreateShop } from "@/hooks/use-shop-admin";
import { useShopStore } from "@/stores/shop-store";
import { config } from "@/lib/config";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
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
      phone: "",
      address: "",
      description: "",
      logoUrl: "",
      coverImageUrl: "",
    },
  });

  const slug = watch("slug");

  function onName(e: React.ChangeEvent<HTMLInputElement>) {
    // Auto-fill slug from name until the user edits the slug manually.
    if (!dirtyFields.slug) setValue("slug", slugify(e.target.value));
  }

  function submit(values: CreateShopForm) {
    createShop.mutate(
      {
        name: values.name,
        slug: values.slug,
        phone: values.phone || undefined,
        address: values.address || undefined,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
        coverImageUrl: values.coverImageUrl || undefined,
      },
      {
        onSuccess: (shop) => {
          setActiveShop(shop.id);
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
          required
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
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              {...register("phone")}
            />
          </FormField>
          <FormField
            label="Address"
            htmlFor="address"
            error={errors.address?.message}
          >
            <Input id="address" placeholder="12 Marina Rd, Lagos" {...register("address")} />
          </FormField>
        </div>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            placeholder="A premium grooming experience in the heart of the city."
            {...register("description")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Logo URL"
            htmlFor="logoUrl"
            error={errors.logoUrl?.message}
          >
            <Input id="logoUrl" placeholder="https://…" {...register("logoUrl")} />
          </FormField>
          <FormField
            label="Cover image URL"
            htmlFor="coverImageUrl"
            error={errors.coverImageUrl?.message}
          >
            <Input
              id="coverImageUrl"
              placeholder="https://…"
              {...register("coverImageUrl")}
            />
          </FormField>
        </div>

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
