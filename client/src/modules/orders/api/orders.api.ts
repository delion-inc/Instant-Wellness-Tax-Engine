import { axiosInstance } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config/api";
import type {
  CreateOrderRequest,
  ImportCsvOptions,
  ImportCsvResponse,
  OrderFilterParams,
  OrderResponse,
  OrdersPageResponse,
} from "../types/order.types";

export const ordersApi = {
  getOrders: async (
    params: OrderFilterParams,
  ): Promise<OrdersPageResponse> => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );

    const response = await axiosInstance.get<OrdersPageResponse>(
      API_ENDPOINTS.orders.list,
      { params: cleaned },
    );
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await axiosInstance.post<OrderResponse>(
      API_ENDPOINTS.orders.create,
      data,
    );
    return response.data;
  },

  importCsv: async (
    file: File,
    options: ImportCsvOptions,
  ): Promise<ImportCsvResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("duplicateHandling", options.duplicateHandling);
    formData.append("outOfScopeHandling", options.outOfScopeHandling);

    const response = await axiosInstance.post<ImportCsvResponse>(
      API_ENDPOINTS.orders.import,
      formData,
    );
    return response.data;
  },
};
