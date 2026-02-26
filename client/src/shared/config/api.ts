export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

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
    list: "/orders",
    create: "/orders",
    import: "/orders/import",
  },
} as const;

export const AUTH_ENDPOINTS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.registration,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.logout,
] as const;
