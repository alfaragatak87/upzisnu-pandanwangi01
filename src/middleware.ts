import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "POST" && pathname === "/admin/login") {
    // If a stale client posts to the page route, forward to the API login handler.
    const url = req.nextUrl.clone();
    url.pathname = "/api/admin/login";
    return NextResponse.rewrite(url);
  }

  if (req.method === "POST" && pathname === "/admin") {
    // Prevent POST to app page route (which can trigger Server Action errors).
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/login"],
};
