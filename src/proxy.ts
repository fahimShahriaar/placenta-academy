// Verifies the NextAuth session (not just cookie presence) via the
// `authorized` callback in lib/auth.ts, redirecting to /admin/login if needed.
export { auth as proxy } from "@/lib/auth";

export const config = {
    matcher: ["/admin/:path*"],
};
