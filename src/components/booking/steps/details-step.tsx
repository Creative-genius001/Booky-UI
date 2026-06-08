"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, User } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { customerSchema, type CustomerForm } from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DetailsStep({
  formId,
  onValid,
}: {
  formId: string;
  onValid: () => void;
}) {
  const { customer, notes, setCustomer, setNotes } = useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      notes: notes,
    },
    mode: "onBlur",
  });

  function submit(values: CustomerForm) {
    setCustomer({
      name: values.name,
      email: values.email,
      phone: values.phone,
    });
    setNotes(values.notes ?? "");
    onValid();
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        We'll use these details to send your booking confirmation. No account needed.
      </p>

      <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="John Doe"
          leftIcon={<User />}
          invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail />}
          invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Phone number"
        htmlFor="phone"
        required
        error={errors.phone?.message}
      >
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+234 800 000 0000"
          leftIcon={<Phone />}
          invalid={!!errors.phone}
          {...register("phone")}
        />
      </FormField>

      <FormField
        label="Notes (optional)"
        htmlFor="notes"
        error={errors.notes?.message}
        hint="Anything the shop should know before your appointment."
      >
        <Textarea
          id="notes"
          placeholder="e.g. Please prepare a low fade"
          invalid={!!errors.notes}
          {...register("notes")}
        />
      </FormField>
    </form>
  );
}
