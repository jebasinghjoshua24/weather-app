import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Outfit, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", preload: false });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", preload: false });
const slab = Roboto_Slab({ subsets: ["latin"], variable: "--font-slab", display: "swap", weight: ["400", "700", "800"], preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Atmos — Weather, beautifully",
    template: "%s · Atmos",
  },
  description:
    "A production-grade weather experience: local forecast, radar, maps, and delightful details. Built with Open-Meteo + Next.js.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Atmos — Weather, beautifully",
    description: "Local weather, radar, maps, and more.",
    type: "website",
    url: siteUrl,
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${mono.variable} ${outfit.variable} ${slab.variable} font-sans antialiased selection:bg-amber-400 selection:text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
