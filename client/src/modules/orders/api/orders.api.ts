import { axiosInstance } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config/api";
import type {
  CreateOrderRequest,
  ImportCsvOptions,
  ImportCsvResponse,
  OrderResponse,
} from "../types/order.types";

export const ordersApi = {
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
