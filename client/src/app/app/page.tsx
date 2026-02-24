"use client";

import { Button } from "@/shared/components/ui/button";
import { useLogout } from "@/modules/auth/hooks/use-auth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

export default function AppPage() {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">You are logged in.</p>
        <Button
          variant="outline"
          size="lg"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="gap-2"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} className="size-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
