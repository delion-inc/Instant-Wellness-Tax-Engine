"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useOrderFilters } from "../../hooks/use-order-filters";
import { useOrders } from "../../hooks/use-orders";
import { useOrdersTour } from "../../hooks/use-orders-tour";
import { OrdersHeader } from "./orders-header";
import { OrdersFilterBar } from "./orders-filter-bar";
import { OrdersTable } from "./orders-table";
import { OrdersPagination } from "./orders-pagination";
import { OrderDetailSheet } from "./order-detail-sheet";
import type { OrderResponse } from "../../types/order.types";

function OrdersPageContent() {
  const filters = useOrderFilters();
  const { data, isLoading } = useOrders(filters.apiParams);
  const { startTour, hasSeenTour } = useOrdersTour();
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && data && !hasSeenTour) {
      const timer = setTimeout(startTour, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data, hasSeenTour, startTour]);

  const handleRowClick = useCallback((order: OrderResponse) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  }, []);

  const handleSheetChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) setSelectedOrder(null);
  }, []);

  const pageData = data ?? {
    content: [],
    page: 0,
    pageSize: filters.params.pageSize,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    sort: [],
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <OrdersHeader onStartTour={startTour} />

      <OrdersFilterBar filters={filters} />

      <OrdersTable
        data={pageData.content}
        totalElements={pageData.totalElements}
        pageSize={pageData.pageSize}
        isLoading={isLoading}
        currentSort={filters.currentSort}
        onSortChange={filters.setSort}
        onRowClick={handleRowClick}
      />

      <OrdersPagination
        page={pageData.page}
        pageSize={pageData.pageSize}
        totalElements={pageData.totalElements}
        totalPages={pageData.totalPages}
        hasNext={pageData.hasNext}
        hasPrevious={pageData.hasPrevious}
        onPageChange={filters.setPagination}
      />

      <OrderDetailSheet order={selectedOrder} open={sheetOpen} onOpenChange={handleSheetChange} />
    </div>
  );
}

export function OrdersPage() {
  return (
    <Suspense>
      <OrdersPageContent />
    </Suspense>
  );
}
