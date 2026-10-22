import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/db/supabase/middleware";

// Routes that require an authenticated user
const PROTECTED_PREFIXES = [
  "/clients",
  "/diet-plans",
  "/whatsapp",
  "/integrations",
  "/settings",
  "/dashboard",
  "/patients",
  "/appointments",
  "/messages",
  "/forms",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through static files and internal Next.js assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Refresh Supabase session
  const { response, user } = await updateSession(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // In production with real Supabase credentials, enforce redirect
  if (isProtectedRoute && !user) {
    const isPlaceholderMode =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
      process.env.NODE_ENV !== "production";

    // In non-production placeholder mode, permit scaffolding preview with a header note
    if (!isPlaceholderMode) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If authenticated user visits /login, redirect to /dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
