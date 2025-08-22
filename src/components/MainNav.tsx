"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MainNav() {
  const pathname = usePathname()
  if (pathname && pathname.startsWith('/admin')) return null
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Tenteks & Nera Yapı" className="h-8 w-auto" />
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/projeler"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Projeler
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Blog
            </Link>
            <Link
              href="/hakkimizda"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              İletişim
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 