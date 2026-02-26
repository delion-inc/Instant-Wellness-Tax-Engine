"use client";

import { LightRays } from "@/shared/components/ui/light-rays";
import { AnimatedGridPattern } from "@/shared/components/ui/animated-grid-pattern";
import { AnimatedThemeToggler } from "@/shared/components/ui/animated-theme-toggler";
import { cn } from "@/shared/lib/utils";
import { AppLogo } from "@/shared/components/app-logo";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { AuthForm } from "./auth-form";
import { FeatureList } from "./feature-list";

export function LandingPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
      {!isMobile && (
        <LightRays
          count={3}
          color="oklch(0.5393 0.2713 286.7462 / 0.25)"
          blur={40}
          speed={16}
          length="100vh"
        />
      )}

      <AnimatedThemeToggler className="absolute right-4 top-4 z-50 rounded-xl border border-border bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-accent" />

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        <div className="relative hidden flex-1 flex-col justify-around overflow-hidden space-y-12 bg-primary/3 p-10 lg:flex xl:p-12">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.08}
            duration={10}
            repeatDelay={1}
            className={cn(
              "text-primary",
              "mask-[radial-gradient(400px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-20%] h-[140%] skew-y-6",
            )}
          />

          <div className="relative z-10">
            <AppLogo className="mb-6" />

            <h1 className="max-w-sm text-3xl font-bold leading-[1.15] tracking-tight text-foreground xl:text-4xl">
              Tax Compliance <span className="text-primary">at High Speed</span>
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Automate composite sales tax calculations for drone deliveries across NY State.
            </p>
          </div>

          <div className="relative z-10">
            <FeatureList />
          </div>
        </div>

        <div className="hidden w-px bg-border lg:block" />

        <div className="flex w-full flex-col lg:w-110 lg:shrink-0">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
