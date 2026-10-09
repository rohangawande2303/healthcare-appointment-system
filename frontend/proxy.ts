import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware
 * 
 * Handles:
 * 1. Protected routes (requires login)
 * 2. Role-based access control (RBAC)
 * 3. Redirecting logged-in users away from auth pages
 */
const authProxy = withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Role-based redirection
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/doctor") && token?.role !== "doctor") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/patient") && token?.role !== "patient") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Only run middleware if the user is authenticated
       */
      authorized: ({ token }) => !!token,
    },
  }
);

export default authProxy;
export { authProxy as proxy };

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/dashboard/:path*",
  ],
};
