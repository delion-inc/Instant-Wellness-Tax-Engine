import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
  UserIcon,
  ArrowRight01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import type { AuthMode } from "../types/auth.types";
import type { LoginFormValues, RegistrationFormValues } from "../types/auth.schemas";

interface AuthFieldsProps {
  mode: AuthMode;
  showPassword: boolean;
  onTogglePassword: () => void;
  loginForm: UseFormReturn<LoginFormValues>;
  registrationForm: UseFormReturn<RegistrationFormValues>;
  serverError: string | null;
  isLoading: boolean;
}

export function AuthFields({
  mode,
  showPassword,
  onTogglePassword,
  loginForm,
  registrationForm,
  serverError,
  isLoading,
}: AuthFieldsProps) {
  const isLogin = mode === "login";
  const emailError = isLogin
    ? loginForm.formState.errors.email?.message
    : registrationForm.formState.errors.email?.message;
  const passwordError = isLogin
    ? loginForm.formState.errors.password?.message
    : registrationForm.formState.errors.password?.message;

  const emailRegister = isLogin ? loginForm.register("email") : registrationForm.register("email");
  const passwordRegister = isLogin
    ? loginForm.register("password")
    : registrationForm.register("password");

  return (
    <>
      {!isLogin && (
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="h-10 pl-9"
                aria-invalid={!!registrationForm.formState.errors.firstName}
                {...registrationForm.register("firstName")}
              />
            </div>
            {registrationForm.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {registrationForm.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="h-10 pl-9"
                aria-invalid={!!registrationForm.formState.errors.lastName}
                {...registrationForm.register("lastName")}
              />
            </div>
            {registrationForm.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {registrationForm.formState.errors.lastName.message}
              </p>
            )}
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
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-10 pl-9"
            aria-invalid={!!emailError}
            {...emailRegister}
          />
        </div>
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {isLogin && (
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
            aria-invalid={!!passwordError}
            {...passwordRegister}
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
        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive text-center">{serverError}</p>}

      <Button
        type="submit"
        className="w-full h-10 gap-2 text-sm font-medium"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
            {isLogin ? "Signing In..." : "Creating Account..."}
          </>
        ) : (
          <>
            {isLogin ? "Sign In" : "Create Account"}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
              data-icon="inline-end"
            />
          </>
        )}
      </Button>
    </>
  );
}
