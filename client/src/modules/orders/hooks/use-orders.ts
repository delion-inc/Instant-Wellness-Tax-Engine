import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import type { OrderFilterParams } from "../types/order.types";

export function useOrders(params: OrderFilterParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.getOrders(params),
  });
}
