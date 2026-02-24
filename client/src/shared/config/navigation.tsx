import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardSquare01Icon, ShoppingBag02Icon } from "@hugeicons/core-free-icons"

export interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} />,
  },
]

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard/orders/new": "Add order",
}

export function getNavTitleByPathname(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  const match =
    NAV_ITEMS.find((item) => item.url === pathname) ??
    NAV_ITEMS.find((item) => item.url !== "/dashboard" && pathname.startsWith(item.url))

  return match?.title ?? "Dashboard"
}
