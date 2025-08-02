import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Login sayfasına erişime izin ver
    if (req.nextUrl.pathname === "/admin/login") {
      return
    }
    
    // Diğer admin route'larına erişim kontrolü
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      if (!req.nextauth.token) {
        return Response.redirect(new URL("/admin/login", req.url))
      }
    }
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