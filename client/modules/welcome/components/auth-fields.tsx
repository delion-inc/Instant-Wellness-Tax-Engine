import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
  UserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

type AuthMode = "login" | "signup";

interface AuthFieldsProps {
  mode: AuthMode;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function AuthFields({ mode, showPassword, onTogglePassword }: AuthFieldsProps) {
  return (
    <>
      {mode === "signup" && (
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={UserIcon}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input id="name" type="text" placeholder="John Doe" className="h-10 pl-9" />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <HugeiconsIcon
            icon={Mail01Icon}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input id="email" type="email" placeholder="you@company.com" className="h-10 pl-9" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {mode === "login" && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <HugeiconsIcon
            icon={LockIcon}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 pl-9 pr-9"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon
              icon={showPassword ? ViewOffIcon : ViewIcon}
              strokeWidth={1.5}
              className="size-4"
            />
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full h-10 gap-2 text-sm font-medium" size="lg">
        {mode === "login" ? "Sign In" : "Create Account"}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={2}
          className="size-4"
          data-icon="inline-end"
        />
      </Button>
    </>
  );
}
