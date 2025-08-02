import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Admin route'larına erişim kontrolü
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      if (!req.nextauth.token) {
        return Response.redirect(new URL("/admin/login", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
} 