import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { OrderStatus } from "../../types/order.types";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  CALCULATED: {
    label: "Calculated",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
  },
  OUT_OF_SCOPE: {
    label: "Out of Scope",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
  },
  FAILED_VALIDATION: {
    label: "Failed",
    className:
      "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25",
  },
  ADDED: {
    label: "Added",
    className: "bg-muted text-muted-foreground border-border",
  },
  PROCESSING: {
    label: "Processing",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.ADDED;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
