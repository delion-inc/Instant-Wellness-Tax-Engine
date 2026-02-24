import { cn } from "@/shared/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <span className="text-sm font-bold text-primary-foreground">IW</span>
      </div>
      <span className="text-base font-semibold tracking-tight">
        Instant Wellness
      </span>
    </div>
  );
}
