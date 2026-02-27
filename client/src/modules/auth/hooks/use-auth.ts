import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import { authStore } from "../stores/auth.store";
import { CURRENT_USER_QUERY_KEY } from "@/shared/hooks/use-current-user";
import type { LoginRequest, RegistrationRequest } from "../types/auth.types";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      authStore.setAuth(response.accessToken);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      router.push("/orders");
    },
  });
};

export const useRegistration = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegistrationRequest) => authApi.registration(data),
    onSuccess: (response) => {
      authStore.setAuth(response.accessToken);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      router.push("/orders");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authStore.clearAuth();
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      router.push("/");
    },
    onError: () => {
      authStore.clearAuth();
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      router.push("/");
    },
  });
};
