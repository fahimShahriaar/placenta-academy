import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Check for the NextAuth session token cookie
    const token =
        request.cookies.get("authjs.session-token") ??
        request.cookies.get("__Secure-authjs.session-token");

    if (!token) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/((?!login).*)"],
};
