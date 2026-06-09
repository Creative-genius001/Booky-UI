import { WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "You're offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">You're offline</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Check your connection and try again. Your place in any booking is saved.
      </p>
    </div>
  );
}
