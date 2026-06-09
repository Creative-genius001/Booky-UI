"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Scissors, Trash2 } from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import { useServices, useDeleteService } from "@/hooks/use-services";
import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceFormDialog } from "@/components/dashboard/service-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";

export default function ServicesPage() {
  const { shopId } = useActiveShop();
  const { data: services, isLoading } = useServices(shopId ?? undefined);
  const deleteService = useDeleteService(shopId ?? "");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(s: Service) {
    setEditing(s);
    setFormOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Services"
        description="The services customers can choose when they book."
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" /> New service
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{s.name}</h3>
                      {!s.is_active && <Badge variant="muted">Inactive</Badge>}
                    </div>
                    {s.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-foreground">
                      {formatNaira(s.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3.5" />
                      {formatDuration(s.duration_in_minutes)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => openEdit(s)}
                      aria-label={`Edit ${s.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(s)}
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Scissors />}
          title="No services yet"
          description="Add your first service so customers have something to book."
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" /> Add service
            </Button>
          }
        />
      )}

      <ServiceFormDialog
        shopId={shopId ?? ""}
        service={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This service will no longer be bookable. Existing bookings are unaffected."
        confirmLabel="Delete"
        destructive
        loading={deleteService.isPending}
        onConfirm={() => {
          if (deleting)
            deleteService.mutate(deleting.id, {
              onSuccess: () => setDeleting(null),
            });
        }}
      />
    </div>
  );
}
