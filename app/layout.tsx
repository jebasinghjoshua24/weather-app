import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

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
      <body className={`${display.variable} ${mono.variable} ${outfit.variable} font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
