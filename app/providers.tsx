"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

/**
 * Global providers: React Query (server data cache) + next-themes (dark mode).
 *
 * Why two separate systems?
 * - TanStack Query: caches, retries, and dedupes API data. Server data lives here.
 * - next-themes: applies the light/dark class to <html>. UI preference lives here.
 *
 * Theme is synced to the Zustand preferences store (single source of truth for
 * user prefs), so C/F unit and theme stay consistent across reloads.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const theme = usePreferencesStore((s) => s.theme);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        value={{ light: "light", dark: "dark", system: "system" }}
        forcedTheme={theme === "system" ? undefined : theme}
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
