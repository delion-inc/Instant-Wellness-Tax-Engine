import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag02Icon } from "@hugeicons/core-free-icons"

export interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Orders",
    url: "/orders",
    icon: <HugeiconsIcon icon={ShoppingBag02Icon} strokeWidth={2} />,
  },
]

const ROUTE_TITLES: Record<string, string> = {
  "/orders/new": "Add order",
  "/orders/new/csv": "Import orders (CSV)",
  "/orders/new/manual": "Add order manually",
}

export function getNavTitleByPathname(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  const match =
    NAV_ITEMS.find((item) => item.url === pathname) ??
    NAV_ITEMS.find((item) => item.url !== "/orders" && pathname.startsWith(item.url))

  return match?.title ?? "Orders"
}
