export function OrdersHeader() {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Review imported and manually created orders, including computed tax breakdown.
        </p>
      </div>
    </div>
  );
}
