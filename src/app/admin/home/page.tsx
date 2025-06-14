'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomeAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [home, setHome] = useState({
    heroTitle: '',
    heroDescription: '',
    heroButton: '',
    heroImage: '',
    sliderImages: [] as string[],
    galleryImages: [] as string[],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchHome = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/home');
        const data = await res.json();
        setHome(data);
      } catch (error) {
        console.error('Ana sayfa verisi yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'slider' | 'gallery') => {
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
    setHome((prev) => {
      if (type === 'hero') return { ...prev, heroImage: uploaded[0] };
      if (type === 'slider') return { ...prev, sliderImages: [...prev.sliderImages, ...uploaded] };
      if (type === 'gallery') return { ...prev, galleryImages: [...prev.galleryImages, ...uploaded] };
      return prev;
    });
    setUploading(false);
  };

  const handleRemoveImage = (type: 'slider' | 'gallery', url: string) => {
    setHome((prev) => {
      if (type === 'slider') return { ...prev, sliderImages: prev.sliderImages.filter((img) => img !== url) };
      if (type === 'gallery') return { ...prev, galleryImages: prev.galleryImages.filter((img) => img !== url) };
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(home),
      });
      if (res.ok) setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ana Sayfa Yönetimi</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Başlığı</label>
              <input type="text" value={home.heroTitle} onChange={e => setHome({ ...home, heroTitle: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Açıklaması</label>
              <textarea value={home.heroDescription} onChange={e => setHome({ ...home, heroDescription: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Buton Metni</label>
              <input type="text" value={home.heroButton} onChange={e => setHome({ ...home, heroButton: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Görseli</label>
              {home.heroImage && <img src={home.heroImage} alt="Hero" className="max-h-32 mb-2" />}
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'hero')} className="text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slider Görselleri</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {home.sliderImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="Slider" className="max-h-24 border-2" />
                    <button type="button" onClick={() => handleRemoveImage('slider', img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple onChange={e => handleImageUpload(e, 'slider')} className="text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Galeri Görselleri</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {home.galleryImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="Galeri" className="max-h-24 border-2" />
                    <button type="button" onClick={() => handleRemoveImage('gallery', img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple onChange={e => handleImageUpload(e, 'gallery')} className="text-gray-900" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={saving || uploading}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {success && <div className="text-green-600 text-sm">Ana sayfa başarıyla güncellendi.</div>}
          </form>
        </div>
      </div>
    </div>
  );
} 