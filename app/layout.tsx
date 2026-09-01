import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Atmos — Weather, beautifully",
    template: "%s · Atmos",
  },
  description:
    "A production-grade weather experience: local forecast, radar, maps, and delightful details. Built with Open-Meteo + Next.js.",
  metadataBase: new URL("https://atmos.example.com"),
  openGraph: {
    title: "Atmos — Weather, beautifully",
    description: "Local weather, radar, maps, and more.",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
