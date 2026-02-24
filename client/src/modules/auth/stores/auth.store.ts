const ACCESS_TOKEN_KEY = "accessToken";

export const authStore = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAuth: (accessToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  clearAuth: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!authStore.getAccessToken();
  },
};
