import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  "Capacity-based scheduling, zero double bookings",
  "Get paid upfront with secure Paystack checkout",
  "One link your customers can book from instantly",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-accent/30 blur-3xl"
        />
        <Link href="/" className="relative z-10">
          <Logo className="[&_span:last-child]:text-white" />
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-balance text-3xl font-bold leading-tight">
            Run a fully-booked shop without the back-and-forth.
          </h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-white/80">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} Bookly
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
