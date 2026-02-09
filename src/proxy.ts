import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isLoggedIn = !!sessionCookie;
  const { pathname } = request.nextUrl;

  // Auth routes (login/register)
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected routes that require authentication
  const protectedPrefixes = ["/ingredients", "/products", "/sales", "/account"];
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect users without organization to onboarding
  if (isLoggedIn && pathname !== "/onboarding" && pathname !== "/login") {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
