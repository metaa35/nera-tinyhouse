"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Media {
  id: number
  title: string
  url: string
  alt?: string
  type: 'IMAGE' | 'VIDEO'
  createdAt: string
}

export default function AdminGaleriPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    alt: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO'
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Galeri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setUploadProgress(0)

    try {
      let mediaUrl = formData.url

      // Eğer dosya seçilmişse Cloudinary'ye yükle
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)
        uploadFormData.append('type', formData.type === 'IMAGE' ? 'image' : 'video')

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          let errorMessage = 'Dosya yükleme hatası'
          try {
            const error = await uploadResponse.json()
            errorMessage = error.error || errorMessage
          } catch (e) {
            const text = await uploadResponse.text()
            console.error('Upload response:', text)
          }
          throw new Error(errorMessage)
        }

        const uploadResult = await uploadResponse.json()
        mediaUrl = uploadResult.url
      } else if (!formData.url) {
        throw new Error('Dosya seçin veya URL girin')
      }

      // Medya kaydını oluştur
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          url: mediaUrl
        }),
      })

      if (response.ok) {
        setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
        setSelectedFile(null)
        setShowUploadForm(false)
        setUploadProgress(0)
        fetchMedia()
      } else {
        const error = await response.json()
        alert(error.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Yükleme hatası:', error)
      alert(error instanceof Error ? error.message : 'Yükleme sırasında bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu medya dosyasını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMedia()
      } else {
        alert('Silme işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Silme sırasında bir hata oluştu')
    }
  }

  const images = media.filter(item => item.type === 'IMAGE')
  const videos = media.filter(item => item.type === 'VIDEO')

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Galeri Yönetimi</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showUploadForm ? 'İptal' : 'Yeni Medya Ekle'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Yeni Medya Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosya Yükle veya URL Gir
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept={formData.type === 'IMAGE' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setSelectedFile(file || null)
                    if (file) {
                      setFormData({ ...formData, url: '' }) // URL'yi temizle
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-500">
                  {formData.type === 'IMAGE' 
                    ? 'Desteklenen formatlar: JPG, PNG, GIF, WebP' 
                    : 'Desteklenen formatlar: MP4, MOV, AVI, WMV, FLV, WebM'
                  }
                </div>
                {selectedFile && (
                  <div className="text-sm text-green-600">
                    Seçilen dosya: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veya URL Gir
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value })
                  if (e.target.value) {
                    setSelectedFile(null) // Dosyayı temizle
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!selectedFile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tür *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'IMAGE' | 'VIDEO' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="IMAGE">Fotoğraf</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !formData.url)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor...' : 'Yükle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                  setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Fotoğraflar</h3>
          <p className="text-3xl font-bold text-blue-600">{images.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Videolar</h3>
          <p className="text-3xl font-bold text-green-600">{videos.length}</p>
        </div>
      </div>

      {/* Media List */}
      <div className="space-y-6">
        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fotoğraflar</h2>
          {images.length === 0 ? (
            <p className="text-gray-500">Henüz fotoğraf yüklenmemiş.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.alt || item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    {item.alt && (
                      <p className="text-sm text-gray-600 mb-2">{item.alt}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Videolar</h2>
          {videos.length === 0 ? (
            <p className="text-gray-500">Henüz video yüklenmemiş.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <video
                    src={item.url}
                    className="w-full h-48 object-cover"
                    controls
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    {item.alt && (
                      <p className="text-sm text-gray-600 mb-2">{item.alt}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 