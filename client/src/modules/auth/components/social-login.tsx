import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon, GithubIcon } from "@hugeicons/core-free-icons";

export function SocialLogin() {
  return (
    <>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1 gap-2 h-10">
          <HugeiconsIcon icon={GoogleIcon} strokeWidth={1.5} className="size-4" />
          Google
        </Button>
        <Button variant="outline" size="lg" className="flex-1 gap-2 h-10">
          <HugeiconsIcon icon={GithubIcon} strokeWidth={1.5} className="size-4" />
          GitHub
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <Separator className="flex-1" />
      </div>
    </>
  );
}
