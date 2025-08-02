import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic burada
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Login sayfasına her zaman erişim ver
        if (req.nextUrl.pathname === "/admin/login") {
          return true
        }
        // Diğer admin sayfaları için token kontrolü
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
} 