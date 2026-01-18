import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "docstokg_token";
const PROTECTED_PATHS = ["/DocsToKG", "/dashboard", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // Allow landing page without authentication
  if (pathname === "/") {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthRoute = pathname.startsWith("/auth");

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/DocsToKG";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/DocsToKG/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
