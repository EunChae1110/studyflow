import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const AUTH_PAGES = new Set(["/login", "/signup"]);

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (AUTH_PAGES.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/i.test(pathname)) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/assignments")) return true;
  if (pathname.startsWith("/calendar")) return true;
  if (pathname.startsWith("/courses")) return true;
  if (pathname.startsWith("/research-library")) return true;
  if (pathname.startsWith("/api/chat")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (session && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && isProtectedPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
