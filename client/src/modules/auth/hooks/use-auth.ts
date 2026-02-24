import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import { authStore } from "../stores/auth.store";
import type { LoginRequest, RegistrationRequest } from "../types/auth.types";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      authStore.setAuth(response.accessToken);
      router.push("/app");
    },
  });
};

export const useRegistration = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegistrationRequest) => authApi.registration(data),
    onSuccess: (response) => {
      authStore.setAuth(response.accessToken);
      router.push("/app");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authStore.clearAuth();
      router.push("/");
    },
    onError: () => {
      authStore.clearAuth();
      router.push("/");
    },
  });
};
