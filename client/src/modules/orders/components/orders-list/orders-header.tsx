import { Button } from "@/shared/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon } from "@hugeicons/core-free-icons";

interface OrdersHeaderProps {
  onStartTour: () => void;
}

export function OrdersHeader({ onStartTour }: OrdersHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Review imported and manually created orders, including computed tax breakdown.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onStartTour} className="gap-1.5 self-start">
        <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
        Page Guide
      </Button>
    </div>
  );
}
