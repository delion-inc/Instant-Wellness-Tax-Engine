export const API_BASE_URL = "https://delion.digital/api/v1";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    registration: "/auth/registration",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  users: {
    current: "/users/current",
  },
  orders: {
    create: "/orders",
  },
} as const;

export const AUTH_ENDPOINTS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.registration,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.logout,
] as const;
