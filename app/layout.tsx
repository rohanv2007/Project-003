import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/ui";
import { OfflineBanner } from "@/components/offline";
import { SimpleModeMount } from "@/components/simple-mode";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Nivarana — Flood & Disaster Resilience",
  description: "Prepare, report, and respond to floods and disasters. Works offline, bilingual, local-first.",
  themeColor: "#0f6f6a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nivarana",
  },
  formatDetection: { telephone: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${grotesk.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream">
          Skip to content
        </a>
        <OfflineBanner />
        <SimpleModeMount />
        <SiteHeader />
        <main id="main" className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</main>
        <footer className="border-t border-line bg-cream">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center">
            <p className="font-display text-sm font-semibold text-ink">Nivarana · Project 003</p>
            <p className="mt-1 text-xs text-faint">
              Local-first: every report, plan and contact stays in this browser. In a real emergency, always call 112.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
