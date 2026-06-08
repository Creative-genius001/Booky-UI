import { Logo } from "@/components/brand/logo";
import { RequireAuth } from "@/components/auth/require-auth";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background">
        <header className="border-b border-border/70 bg-background/80 backdrop-blur">
          <div className="container flex h-16 items-center">
            <Logo />
          </div>
        </header>
        <main className="container max-w-xl py-8 sm:py-12">{children}</main>
      </div>
    </RequireAuth>
  );
}
