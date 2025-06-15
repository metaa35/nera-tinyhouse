// Gereksiz içerik veya yönlendirme varsa kaldırıyorum, sade bir hoşgeldin bırakıyorum.
// ... mevcut kod ... 

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full flex flex-col items-center">
        <div className="mb-4">
          <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-blue-700">Admin Paneline Hoşgeldiniz</h1>
        <p className="text-gray-600 mb-6 text-center">Projelerinizi kolayca ekleyin, düzenleyin ve yönetin. Tüm içerik ve görselleri bulut tabanlı olarak kontrol edebilirsiniz.</p>
        <Link href="/admin/projeler" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-lg font-semibold transition">
          Projeleri Yönet
        </Link>
      </div>
    </div>
  );
} 