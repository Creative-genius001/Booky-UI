"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceForm } from "@/lib/validation";
import { useCreateService, useUpdateService } from "@/hooks/use-services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Service } from "@/types";

export function ServiceFormDialog({
  shopId,
  service,
  open,
  onOpenChange,
}: {
  shopId: string;
  service?: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!service;
  const create = useCreateService(shopId);
  const update = useUpdateService(shopId);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      priceNaira: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name ?? "",
        description: service?.description ?? "",
        durationMinutes: service?.durationMinutes ?? 30,
        priceNaira: service ? service.priceKobo / 100 : 0,
        isActive: service?.isActive ?? true,
      });
    }
  }, [open, service, reset]);

  const isActive = watch("isActive");

  function submit(values: ServiceForm) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      durationMinutes: values.durationMinutes,
      priceKobo: Math.round(values.priceNaira * 100),
      isActive: values.isActive,
    };
    const onSuccess = () => onOpenChange(false);
    if (isEdit && service) {
      update.mutate({ id: service.id, input: payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "New service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details customers see when booking."
              : "Add a service customers can book and pay for."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField
            label="Name"
            htmlFor="svc-name"
            required
            error={errors.name?.message}
          >
            <Input
              id="svc-name"
              placeholder="Skin fade"
              invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="svc-desc"
            error={errors.description?.message}
          >
            <Textarea
              id="svc-desc"
              placeholder="What's included in this service?"
              {...register("description")}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Duration"
              htmlFor="svc-duration"
              required
              error={errors.durationMinutes?.message}
            >
              <Input
                id="svc-duration"
                type="number"
                inputMode="numeric"
                invalid={!!errors.durationMinutes}
                rightSlot={
                  <span className="pr-2 text-xs text-muted-foreground">min</span>
                }
                {...register("durationMinutes")}
              />
            </FormField>
            <FormField
              label="Price"
              htmlFor="svc-price"
              required
              error={errors.priceNaira?.message}
            >
              <Input
                id="svc-price"
                type="number"
                inputMode="decimal"
                invalid={!!errors.priceNaira}
                leftIcon={<span className="text-sm">₦</span>}
                {...register("priceNaira")}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="svc-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Only active services are bookable.
              </p>
            </div>
            <Switch
              id="svc-active"
              checked={isActive}
              onCheckedChange={(v) => setValue("isActive", v)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? "Save changes" : "Create service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
