"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {pathname !== '/admin/login' && (
        <nav className="bg-white shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <Link href="/admin" className="text-xl font-bold text-blue-700 tracking-wide">Admin Paneli</Link>
                <Link href="/admin" className={isActive('/admin') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Ana Sayfa</Link>
                <Link href="/admin/projeler" className={isActive('/admin/projeler') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Projeler</Link>
                <Link href="/admin/ekibimiz" className={isActive('/admin/ekibimiz') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Ekibimiz</Link>
                <Link href="/admin/faq" className={isActive('/admin/faq') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>SSS</Link>
              </div>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-gray-500 hover:text-red-600 text-sm font-medium border px-4 py-1 rounded"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  )
} 