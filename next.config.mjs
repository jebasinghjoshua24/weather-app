import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Security headers ──
  // Why: Every response gets these headers to prevent XSS, clickjacking,
  // SSL-strip, and data leaks. Think of it as a seatbelt that self-tightens.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS — tell browsers to ALWAYS use HTTPS, even if the user types http://
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // CSP — only allow loading resources from places we trust
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: allow self + next.js inline scripts (hashed by Next)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Styles: allow self + inline styles (next.js + tailwind)
              "style-src 'self' 'unsafe-inline'",
              // Images: allow self + OSM tiles + RainViewer + YouTube + Open-Meteo placeholders
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tilecache.rainviewer.com https://i.ytimg.com https://img.youtube.com https://openstreetmap.org",
              // Fonts: self-hosted via next/font
              "font-src 'self'",
              // Connect: APIs we talk to directly (open-meteo is direct, not proxied)
              "connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com https://api.rainviewer.com https://eonet.gsfc.nasa.gov https://*.supabase.co",
              // Frames: no one should embed our app
              "frame-ancestors 'none'",
              // Workers: for service worker (PWA) + globe (WebGL)
              "worker-src 'self' blob:",
              // Media: for YouTube embeds (if used)
              "media-src 'self' https://www.youtube.com",
              // Base URI: no base tag hijacking
              "base-uri 'self'",
              // Form action: only submit to ourselves
              "form-action 'self'",
            ].join("; "),
          },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Referrer policy: never leak URL params to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions: only allow geolocation and microphone when the user explicitly asks
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(self), camera=(), display-capture=(), fullscreen=()",
          },
          // Cross-Origin: prevent cross-origin attacks
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      // Allow the OSM tile server to render our map tiles
      {
        source: "/maps/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },

  // ── Images: only allow loading from trusted sources ──
  // Why: Without this, Next.js Image Optimization can be abused as an
  // open-proxy (GHSA-9g9p-9gw9-jx7f). We explicitly allowlist every host.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
      { protocol: "https", hostname: "tilecache.rainviewer.com" },
      { protocol: "https", hostname: "api.rainviewer.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "openstreetmap.org" },
    ],
  },

  typedRoutes: true,

  turbopack: {
    root: ".",
  },
};

// ── Sentry wrapper ──
// Only wraps if we have a DSN; otherwise acts as a no-op.
const sentryEnabled = Boolean(process.env.SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Sentry webpack plugin options
      org: process.env.SENTRY_ORG || "",
      project: process.env.SENTRY_PROJECT || "",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      reactComponentAnnotation: { enabled: true },
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;