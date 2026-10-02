import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (token?.isBlocked) {
      return NextResponse.redirect(new URL("/login?error=AccountBlocked", req.url));
    }

    if (pathname.startsWith("/admin")) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes — no auth required
        const publicPrefixes = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/api/auth",
          "/api/categories",
          "/api/templates",
          "/api/health",
          // Editor is public — guests can use it, but get a banner
          "/editor",
        ];
        const isPublic = publicPrefixes.some(
          (r) => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r + "?")
        );
        if (isPublic) return true;

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
