import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Smartphone,
    title: "Mobile-first booking",
    body: "A booking flow built for thumbs. Customers book in under a minute, no app or account required.",
  },
  {
    icon: Zap,
    title: "Capacity-based slots",
    body: "Forget per-barber calendars. Set your shop capacity and Bookly fills every slot automatically.",
  },
  {
    icon: CreditCard,
    title: "Payment-first",
    body: "Secure Paystack checkout means every confirmed booking is already paid for. No more no-shows.",
  },
  {
    icon: CalendarCheck,
    title: "One dashboard",
    body: "Services, hours, blocked dates, bookings and analytics — everything in one premium dashboard.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-5">
            <Sparkles className="size-3.5" /> Booking, beautifully simple
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-secondary sm:text-6xl">
            The fastest way for barbershops to get booked & paid
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Bookly turns your shop link into a premium booking experience.
            Customers pick a service, choose a time and pay — you just show up
            and cut.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/signup">
                Create your shop <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/book/demo-shop">View a demo booking</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="pt-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="overflow-hidden rounded-3xl bg-secondary px-6 py-14 text-center sm:px-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to fill your chairs?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-balance text-white/70">
            Set up your shop in minutes and share one link with every customer.
          </p>
          <Button asChild size="xl" className="mt-7">
            <Link href="/signup">
              Get started free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} Bookly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
