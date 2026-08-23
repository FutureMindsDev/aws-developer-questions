import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/onboarding", "/login", "/signup"];

const AUTH_COOKIE_NAMES = [
  "auth_token",
  "accessToken",
  "CognitoIdentityServiceProvider",
  "next-auth.session-token",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const hasAuthCookie = AUTH_COOKIE_NAMES.some(
    (name) => Boolean(request.cookies.get(name)?.value)
  );

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};