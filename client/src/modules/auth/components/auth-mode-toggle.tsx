import type { AuthMode } from "../types/auth.types";

interface AuthModeToggleProps {
  mode: AuthMode;
  onToggle: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onToggle }: AuthModeToggleProps) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {mode === "login" ? (
        <>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => onToggle("signup")}
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onToggle("login")}
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </button>
        </>
      )}
    </p>
  );
}
