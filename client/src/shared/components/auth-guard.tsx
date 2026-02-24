"use client";

import { use, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { authStore } from "@/modules/auth/stores/auth.store";
import { ClientMountContext } from "@/shared/components/providers";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const isMounted = use(ClientMountContext);

  if (!isMounted) {
    return null;
  }

  if (!authStore.isAuthenticated()) {
    redirect("/");
  }

  return <>{children}</>;
};
