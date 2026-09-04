import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ATMOSPHERE Weather",
    short_name: "Atmos",
    description: "Live weather, radar, and delights — offline-ready",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#f59e0b",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
