'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function YouTubeUploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: ''
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      // YouTube URL'ini doğrula
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
      if (!youtubeRegex.test(formData.url)) {
        throw new Error('Geçerli bir YouTube URL\'i girin')
      }

      // Video ID'sini çıkar
      const videoId = extractVideoId(formData.url)
      if (!videoId) {
        throw new Error('YouTube video ID\'si bulunamadı')
      }

      // Veritabanına kaydet
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          url: formData.url,
          type: 'VIDEO',
          source: 'youtube',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          alt: formData.description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Video kaydedilemedi')
      }

      alert('YouTube video başarıyla eklendi!')
      router.push('/admin/galeri')
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, url })
    const videoId = extractVideoId(url)
    if (videoId && !formData.title) {
      // URL'den otomatik başlık çıkar (basit)
      setFormData(prev => ({ 
        ...prev, 
        url,
        title: `YouTube Video - ${videoId}`
      }))
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">YouTube Video Ekle</h1>
        <p className="text-gray-600">YouTube video URL'sini girerek galeriye ekleyin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Video URL'si *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Desteklenen formatlar: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Video başlığını girin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Video açıklaması (opsiyonel)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Video Ekle
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/galeri')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>

      {/* Örnek URL'ler */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Desteklenen URL Formatları</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
          <p>• https://youtu.be/dQw4w9WgXcQ</p>
          <p>• https://www.youtube.com/embed/dQw4w9WgXcQ</p>
        </div>
      </div>
    </div>
  )
} 