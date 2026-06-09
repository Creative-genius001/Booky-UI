"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { customerSchema, type CustomerForm } from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export function DetailsStep({
  formId,
  onValid,
}: {
  formId: string;
  onValid: () => void;
}) {
  const { customer, setCustomer } = useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: customer.name, email: customer.email },
    mode: "onBlur",
  });

  function submit(values: CustomerForm) {
    setCustomer({ name: values.name, email: values.email });
    onValid();
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        We'll email your booking confirmation here. No account needed.
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
    </form>
  );
}
