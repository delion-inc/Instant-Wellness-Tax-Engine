"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AuthHeader } from "./auth-header";
import { SocialLogin } from "./social-login";
import { AuthFields } from "./auth-fields";
import { AuthModeToggle } from "./auth-mode-toggle";
import { useLogin, useRegistration } from "../hooks/use-auth";
import { loginSchema, registrationSchema } from "../types/auth.schemas";
import type { AuthMode } from "../types/auth.types";
import type { LoginFormValues, RegistrationFormValues } from "../types/auth.schemas";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registrationMutation = useRegistration();

  const loginForm = useForm<LoginFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registrationForm = useForm<RegistrationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registrationSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const isLoading = loginMutation.isPending || registrationMutation.isPending;

  const handleModeToggle = (newMode: AuthMode) => {
    setMode(newMode);
    setServerError(null);
    loginForm.reset();
    registrationForm.reset();
    setShowPassword(false);
  };

  const handleLoginSubmit = loginForm.handleSubmit((data) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onError: (error) => {
        if (error instanceof AxiosError) {
          setServerError(error.response?.data?.message ?? "Invalid email or password");
          return;
        }
        setServerError("Something went wrong. Please try again.");
      },
    });
  });

  const handleRegistrationSubmit = registrationForm.handleSubmit((data) => {
    setServerError(null);
    registrationMutation.mutate(data, {
      onError: (error) => {
        if (error instanceof AxiosError) {
          setServerError(error.response?.data?.message ?? "Registration failed");
          return;
        }
        setServerError("Something went wrong. Please try again.");
      },
    });
  });

  const handleSubmit = mode === "login" ? handleLoginSubmit : handleRegistrationSubmit;

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
      <div className="w-full max-w-sm">
        <AuthHeader mode={mode} />
        <SocialLogin />
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthFields
            mode={mode}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            loginForm={loginForm}
            registrationForm={registrationForm}
            serverError={serverError}
            isLoading={isLoading}
          />
        </form>
        <AuthModeToggle mode={mode} onToggle={handleModeToggle} />
      </div>
    </div>
  );
}
