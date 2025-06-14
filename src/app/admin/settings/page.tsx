'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="Nera Logo"
              width={200}
              height={50}
              priority
            />
          </div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Site Ayarları</h1>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Adı
                </label>
                <input
                  type="text"
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Açıklaması
                </label>
                <textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  İletişim E-posta Adresi
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Bakım Modu
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
              {success && <div className="text-green-600 text-sm">Ayarlar başarıyla kaydedildi.</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 