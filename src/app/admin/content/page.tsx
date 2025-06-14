'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Content {
  id: string;
  title: string;
  type: string;
  status: string;
  lastModified: string;
  description?: string;
  content?: string;
  images?: string[];
  coverImage?: string;
}

export default function ContentManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState({ title: '', type: 'Sayfa', status: 'Yayında' });
  const [saving, setSaving] = useState(false);
  const [editContent, setEditContent] = useState<Content & { description?: string; content?: string; images?: string[]; coverImage?: string }>({
    id: '', title: '', type: '', status: '', lastModified: '', description: '', content: '', images: [], coverImage: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContents(data);
    } catch (error) {
      console.error('İçerikler yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchContents();
  }, []);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent),
      });
      if (res.ok) {
        setShowModal(false);
        setNewContent({ title: '', type: 'Sayfa', status: 'Yayında' });
        fetchContents();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    await fetch('/api/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchContents();
  };

  const handleEditContent = (content: Content) => {
    setEditContent({ ...content, description: content.description || '', content: content.content || '', images: content.images || [], coverImage: content.coverImage || '' });
    setShowEditModal(true);
  };

  const handleEditContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContent),
      });
      setShowEditModal(false);
      fetchContents();
    } finally {
      setEditSaving(false);
    }
  };

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
    setEditContent((prev) => ({ ...prev, images: [...(prev.images || []), ...uploaded] }));
    setUploading(false);
  };

  const handleRemoveImage = (url: string) => {
    setEditContent((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img !== url),
      coverImage: prev.coverImage === url ? (prev.images?.[0] || '') : prev.coverImage,
    }));
  };

  if (status === 'loading') return <div>Yükleniyor...</div>;

  if (!session) {
    return null;
  }

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">İçerik Yönetimi</h1>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowModal(true)}
            >
              Yeni İçerik Ekle
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {contents.map((content) => (
                <li key={content.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{content.title}</div>
                          <div className="text-sm text-gray-500">{content.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          content.status === 'Yayında' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {content.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Son düzenleme: {content.lastModified}
                        </span>
                        <button className="text-blue-600 hover:text-blue-900" onClick={() => handleEditContent(content)}>Düzenle</button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteContent(content.id)}>Sil</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* İçerik Ekle Modalı */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Yeni İçerik Ekle</h2>
                <form onSubmit={handleAddContent} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Başlık"
                    value={newContent.title}
                    onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                  <select
                    value={newContent.type}
                    onChange={e => setNewContent({ ...newContent, type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="Sayfa">Sayfa</option>
                    <option value="Blog">Blog</option>
                  </select>
                  <select
                    value={newContent.status}
                    onChange={e => setNewContent({ ...newContent, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="Yayında">Yayında</option>
                    <option value="Taslak">Taslak</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setShowModal(false)}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={saving}
                    >
                      {saving ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* İçerik Düzenle Modalı */}
          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">İçeriği Düzenle</h2>
                <form onSubmit={handleEditContentSave} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Başlık"
                    value={editContent.title}
                    onChange={e => setEditContent({ ...editContent, title: e.target.value })}
                    required
                    className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 !text-gray-900 bg-white placeholder-gray-500 font-medium"
                    style={{ color: '#111' }}
                  />
                  <textarea
                    placeholder="Açıklama"
                    value={editContent.description || ''}
                    onChange={e => setEditContent({ ...editContent, description: e.target.value })}
                    className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 !text-gray-900 bg-white placeholder-gray-500 font-medium"
                    style={{ color: '#111' }}
                  />
                  <textarea
                    placeholder="İçerik Metni"
                    value={editContent.content || ''}
                    onChange={e => setEditContent({ ...editContent, content: e.target.value })}
                    className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 !text-gray-900 bg-white placeholder-gray-500 font-medium"
                    style={{ color: '#111' }}
                  />
                  <div>
                    <label className="block mb-1">Görseller</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mb-2" />
                    {uploading && <div className="text-blue-600 text-sm">Yükleniyor...</div>}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {(editContent.images || []).map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} alt="Görsel" className="max-h-24 border-2" style={{ borderColor: editContent.coverImage === img ? 'blue' : 'transparent' }} />
                          <button type="button" onClick={() => setEditContent((prev) => ({ ...prev, coverImage: img }))} className={`absolute top-0 left-0 bg-white text-xs px-2 py-1 rounded-br ${editContent.coverImage === img ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{editContent.coverImage === img ? 'Kapak' : 'Kapak Yap'}</button>
                          <button type="button" onClick={() => handleRemoveImage(img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <select
                    value={editContent.status}
                    onChange={e => setEditContent({ ...editContent, status: e.target.value })}
                    className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 !text-gray-900 bg-white font-medium"
                    style={{ color: '#111' }}
                  >
                    <option value="Yayında">Yayında</option>
                    <option value="Taslak">Taslak</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setShowEditModal(false)}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={editSaving}
                    >
                      {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 