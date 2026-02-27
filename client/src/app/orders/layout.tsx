"use client";

import { AuthGuard } from "@/shared/components/auth-guard";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { LightRays } from "@/shared/components/ui/light-rays";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          {!isMobile && (
            <LightRays
              count={3}
              color="oklch(0.5393 0.2713 286.7462 / 0.25)"
              blur={40}
              speed={16}
              length="100vh"
            />
          )}
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
