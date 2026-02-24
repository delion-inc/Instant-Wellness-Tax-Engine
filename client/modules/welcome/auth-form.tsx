"use client";

import { useState } from "react";
import { AuthHeader } from "./components/auth-header";
import { SocialLogin } from "./components/social-login";
import { AuthFields } from "./components/auth-fields";
import { AuthModeToggle } from "./components/auth-mode-toggle";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
      <div className="w-full max-w-sm">
        <AuthHeader mode={mode} />
        <SocialLogin />
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <AuthFields
            mode={mode}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </form>
        <AuthModeToggle mode={mode} onToggle={setMode} />
      </div>
    </div>
  );
}
