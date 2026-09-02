import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Root middleware — runs on EVERY request (except static files).
 * Why: refreshes the Supabase session (JWT rotation) and keeps the
 * anon-by-default experience working for signed-in users.
 *
 * Think of it as a ticket-checker at the door: it silently renews your
 * hall pass so you never get kicked out mid-visit.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all routes except Next internals + static assets.
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico / icons / public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
