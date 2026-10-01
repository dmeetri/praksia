import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Block access for blocked users
    if (token?.isBlocked) {
      return NextResponse.redirect(new URL("/login?error=AccountBlocked", req.url));
    }

    // Admin routes — require isAdmin
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
        // Public routes
        const publicRoutes = ["/", "/login", "/register", "/api/auth"];
        const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
