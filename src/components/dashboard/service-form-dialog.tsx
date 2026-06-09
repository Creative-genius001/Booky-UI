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
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      barbing_duration: 60,
      price: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name ?? "",
        description: service?.description ?? "",
        barbing_duration: service?.duration_in_minutes ?? 60,
        price: service?.price ?? 0,
      });
    }
  }, [open, service, reset]);

  function submit(values: ServiceForm) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      barbing_duration: values.barbing_duration,
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
              error={errors.barbing_duration?.message}
            >
              <Input
                id="svc-duration"
                type="number"
                inputMode="numeric"
                invalid={!!errors.barbing_duration}
                rightSlot={
                  <span className="pr-2 text-xs text-muted-foreground">min</span>
                }
                {...register("barbing_duration")}
              />
            </FormField>
            <FormField
              label="Price"
              htmlFor="svc-price"
              required
              error={errors.price?.message}
            >
              <Input
                id="svc-price"
                type="number"
                inputMode="numeric"
                invalid={!!errors.price}
                leftIcon={<span className="text-sm">₦</span>}
                {...register("price")}
              />
            </FormField>
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
