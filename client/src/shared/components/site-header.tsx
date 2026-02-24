"use client"

import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AnimatedThemeToggler } from "@/shared/components/ui/animated-theme-toggler"
import { getNavTitleByPathname } from "@/shared/config/navigation"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  const title = getNavTitleByPathname(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-7"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto">
          <AnimatedThemeToggler className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" />
        </div>
      </div>
    </header>
  )
}
