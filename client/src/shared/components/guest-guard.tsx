"use client";

import { use, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { authStore } from "@/modules/auth/stores/auth.store";
import { ClientMountContext } from "@/shared/components/providers";

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard = ({ children }: GuestGuardProps) => {
  const isMounted = use(ClientMountContext);

  if (!isMounted) {
    return null;
  }

  if (authStore.isAuthenticated()) {
    redirect("/orders");
  }

  return <>{children}</>;
};
