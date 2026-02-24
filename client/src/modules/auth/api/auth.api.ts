import { axiosInstance } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config/api";
import type { AuthResponse, LoginRequest, RegistrationRequest } from "../types/auth.types";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
    return response.data;
  },

  registration: async (data: RegistrationRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.auth.registration, data);
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.auth.refresh);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.auth.logout);
  },
};
