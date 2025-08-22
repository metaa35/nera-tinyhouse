'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isActive = (path: string) => pathname === path;

  // Authentication kontrolü
  useEffect(() => {
    if (status === 'loading') return; // Yükleme durumunda bekle
    
    if (!session && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [session, status, router, pathname]);

  // Login sayfasındaysa sadece children'ı göster
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Yükleme durumunda loading göster
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapmamışsa loading göster (yönlendirme sırasında)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-blue-700 tracking-wide">Admin Paneli</Link>
              <Link href="/admin" className={isActive('/admin') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Ana Sayfa</Link>
              <Link href="/admin/projeler" className={isActive('/admin/projeler') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Projeler</Link>
              <Link href="/admin/galeri" className={isActive('/admin/galeri') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Galeri</Link>
              <Link href="/admin/e-katalog" className={isActive('/admin/e-katalog') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>E-Katalog</Link>
              <Link href="/admin/ekibimiz" className={isActive('/admin/ekibimiz') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Ekibimiz</Link>
              <Link href="/admin/faq" className={isActive('/admin/faq') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>SSS</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-gray-500 hover:text-red-600 text-sm font-medium border px-4 py-1 rounded"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
} 