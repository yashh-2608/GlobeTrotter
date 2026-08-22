export { auth as proxy } from "@/auth"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trips/:path*",
    "/destinations/:path*",
    "/activities/:path*",
    "/community/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
}
