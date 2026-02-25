import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import type { CreateOrderRequest } from "../types/order.types";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
  });
};
