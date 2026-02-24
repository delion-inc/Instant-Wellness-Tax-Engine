"use client"

import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { useCurrentUser } from "@/shared/hooks/use-current-user"
import { useLogout } from "@/modules/auth/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function NavUser() {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?"

  const fullName = user ? `${user.firstName} ${user.lastName}` : ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center">
          <SidebarMenuButton size="lg" className="cursor-default flex-1 hover:bg-transparent active:bg-transparent">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email}
              </span>
            </div>
          </SidebarMenuButton>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Log out"
              >
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to log out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
