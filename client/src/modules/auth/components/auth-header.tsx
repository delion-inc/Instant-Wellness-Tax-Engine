import type { AuthMode } from "../types/auth.types";

interface AuthHeaderProps {
  mode: AuthMode;
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-1 flex items-center gap-2.5 lg:hidden">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-primary-foreground">IW</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Instant Wellness
        </span>
      </div>
      <p className="mt-4 text-xl font-semibold text-foreground">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "login"
          ? "Sign in to access your tax dashboard"
          : "Get started with automated tax compliance"}
      </p>
    </div>
  );
}
