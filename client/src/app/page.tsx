import { LandingPage } from "@/modules/auth";
import { GuestGuard } from "@/shared/components/guest-guard";

export default function Page() {
  return (
    <GuestGuard>
      <LandingPage />
    </GuestGuard>
  );
}
