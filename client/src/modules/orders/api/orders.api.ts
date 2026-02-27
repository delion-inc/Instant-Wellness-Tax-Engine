import { axiosInstance } from "@/shared/api";
import { API_BASE_URL, API_ENDPOINTS } from "@/shared/config/api";
import type {
  CreateOrderRequest,
  ImportCsvOptions,
  ImportResponse,
  OrderFilterParams,
  OrderResponse,
  OrdersPageResponse,
} from "../types/order.types";

export const ordersApi = {
  getOrders: async (params: OrderFilterParams): Promise<OrdersPageResponse> => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );

    const response = await axiosInstance.get<OrdersPageResponse>(API_ENDPOINTS.orders.list, {
      params: cleaned,
    });
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await axiosInstance.post<OrderResponse>(API_ENDPOINTS.orders.create, data);
    return response.data;
  },

  importCsv: async (file: File, options: ImportCsvOptions): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("duplicateHandling", options.duplicateHandling);
    formData.append("outOfScopeHandling", options.outOfScopeHandling);

    const response = await axiosInstance.post<ImportResponse>(
      API_ENDPOINTS.orders.import,
      formData,
    );
    return response.data;
  },

  getImportProgressUrl: (trackingId: string): string =>
    `${API_BASE_URL}${API_ENDPOINTS.orders.imports.progress(trackingId)}`,

  getImportSummary: async (trackingId: string): Promise<ImportResponse> => {
    const response = await axiosInstance.get<ImportResponse>(
      API_ENDPOINTS.orders.imports.summary(trackingId),
    );
    return response.data;
  },

  downloadImportErrors: async (trackingId: string): Promise<void> => {
    const response = await axiosInstance.get(API_ENDPOINTS.orders.imports.errors(trackingId), {
      responseType: "blob",
    });

    const url = URL.createObjectURL(response.data as Blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `import-${trackingId}-errors.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
