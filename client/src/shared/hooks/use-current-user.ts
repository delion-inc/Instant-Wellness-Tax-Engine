import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config/api";
import { authStore } from "@/modules/auth/stores/auth.store";
import type { User } from "@/shared/types/user.types";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>(API_ENDPOINTS.users.current);
      return data;
    },
    enabled: authStore.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
