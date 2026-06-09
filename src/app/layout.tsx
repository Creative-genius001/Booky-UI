import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { RegisterSW } from "@/components/system/register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bookly — Book your spot in seconds",
    template: "%s · Bookly",
  },
  description:
    "Bookly is a mobile-first booking platform for barbershops. Pick a service, choose a time, pay and you're booked.",
  applicationName: "Bookly",
  appleWebApp: { capable: true, title: "Bookly", statusBarStyle: "default" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#E05A29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
        <RegisterSW />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ className: "rounded-xl" }}
        />
      </body>
    </html>
  );
}
