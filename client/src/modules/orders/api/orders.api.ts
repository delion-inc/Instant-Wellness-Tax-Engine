import { axiosInstance } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config/api";
import type { CreateOrderRequest, OrderResponse } from "../types/order.types";

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await axiosInstance.post<OrderResponse>(
      API_ENDPOINTS.orders.create,
      data,
    );
    return response.data;
  },
};
