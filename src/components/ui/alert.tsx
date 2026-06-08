import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border p-4 text-sm [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-accent/40 bg-accent/10 text-foreground",
        success: "border-success/30 bg-success/10 text-foreground",
        warning: "border-warning/40 bg-warning/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle,
} as const;

const colorMap = {
  info: "text-accent-foreground",
  success: "text-success",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
} as const;

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  hideIcon?: boolean;
}

export function Alert({
  className,
  variant = "info",
  title,
  hideIcon,
  children,
  ...props
}: AlertProps) {
  const v = variant ?? "info";
  const Icon = iconMap[v];
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {!hideIcon && <Icon className={colorMap[v]} />}
      <div className="space-y-0.5">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
