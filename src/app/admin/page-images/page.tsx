'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PAGES = [
  { slug: 'anasayfa', label: 'Ana Sayfa' },
  { slug: 'hakkimizda', label: 'Hakkımızda' },
  { slug: 'projeler', label: 'Projeler' },
  { slug: 'iletisim', label: 'İletişim' },
];

export default function PageImagesAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [active, setActive] = useState('anasayfa');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/page-images?slug=${active}`);
        const data = await res.json();
        setImages(data);
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [active]);

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (!session) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img !== url));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    await fetch(`/api/page-images?slug=${active}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sayfa Görselleri Yönetimi</h1>
          <div className="flex gap-2 mb-6">
            {PAGES.map(page => (
              <button
                key={page.slug}
                className={`px-4 py-2 rounded font-medium border ${active === page.slug ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border-gray-300'}`}
                onClick={() => setActive(page.slug)}
              >
                {page.label}
              </button>
            ))}
          </div>
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Görseller</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="Görsel" className="max-h-24 border-2" />
                    <button type="button" onClick={() => handleRemoveImage(img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-gray-900" />
              {uploading && <div className="text-blue-600 text-sm">Yükleniyor...</div>}
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={saving || uploading}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {success && <div className="text-green-600 text-sm mt-2">Görseller başarıyla kaydedildi.</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 