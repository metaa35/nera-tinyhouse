"use client"

import { useState, useEffect } from 'react'
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer'
import YouTubeVideoPlayer from '@/components/YouTubeVideoPlayer'

interface Media {
  id: number
  title: string
  url: string
  alt?: string
  type: 'IMAGE' | 'VIDEO'
  source?: string
  thumbnail?: string
  createdAt: string
}

declare global {
  interface Window {
    cloudinary: any
  }
}

export default function AdminGaleriPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewVideo, setPreviewVideo] = useState<Media | null>(null)
  const [editingItem, setEditingItem] = useState<Media | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    alt: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO'
  })

  useEffect(() => {
    fetchMedia()
    // Cloudinary widget script'ini yükle
    const script = document.createElement('script')
    script.src = 'https://upload-widget.cloudinary.com/global/all.js'
    script.async = true
    script.onload = () => {
      console.log('Cloudinary widget loaded')
    }
    document.head.appendChild(script)
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Medya yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary widget yüklenemedi, lütfen sayfayı yenileyin')
      return
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'df770zzfr',
        uploadPreset: 'ml_default',
        folder: 'gallery/videos',
        resourceType: 'video',
        maxFileSize: 500000000, // 500MB
        allowedFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
        eager: [
          { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
        ],
        showAdvancedOptions: false,
        cropping: false,
        multiple: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          }
        }
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          console.log('Video uploaded successfully:', result.info.secure_url)
          setFormData({ ...formData, url: result.info.secure_url })
          alert('Video başarıyla yüklendi! Şimdi başlık ve diğer bilgileri girebilirsiniz.')
        } else if (error) {
          console.error('Upload error:', error)
          alert('Video yükleme hatası: ' + (error.message || 'Bilinmeyen hata'))
        }
      }
    )

    widget.open()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let mediaUrl = formData.url

      // Eğer dosya seçilmişse Cloudinary'ye yükle
      if (selectedFile) {
        if (formData.type === 'VIDEO') {
          // Video dosyaları için direkt Cloudinary upload (Vercel API'si kullanmadan)
          console.log('Video uploading directly to Cloudinary...')
          
          // Önce signature al
          const timestamp = Math.round(new Date().getTime() / 1000)
          const params = {
            timestamp,
            folder: 'gallery/videos',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
            eager: [
              { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
            ]
          }
          
          const signatureResponse = await fetch('/api/media/signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          })
          
          if (!signatureResponse.ok) {
            throw new Error('Signature oluşturulamadı')
          }
          
          const signatureData = await signatureResponse.json()
          
          // Direkt Cloudinary'ye upload
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFile)
          uploadFormData.append('timestamp', timestamp.toString())
          uploadFormData.append('signature', signatureData.signature)
          uploadFormData.append('api_key', signatureData.api_key)
          uploadFormData.append('folder', 'gallery/videos')
          uploadFormData.append('resource_type', 'video')
          uploadFormData.append('allowed_formats', 'mp4,mov,avi,wmv,flv,webm')
          uploadFormData.append('eager', JSON.stringify([
            { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
          ]))
          
          console.log('Starting direct Cloudinary upload...')
          
          const directResponse = await fetch('https://api.cloudinary.com/v1_1/df770zzfr/video/upload', {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (!directResponse.ok) {
            const errorText = await directResponse.text()
            console.error('Direct upload error:', errorText)
            throw new Error(`Video upload başarısız: ${directResponse.status} - ${errorText}`)
          }
          
          const directResult = await directResponse.json()
          mediaUrl = directResult.secure_url
          console.log('Video uploaded successfully:', mediaUrl)
          
        } else {
          // Resim dosyaları için normal upload
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFile)
          uploadFormData.append('type', 'image')

          const uploadResponse = await fetch('/api/media/upload', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            let errorMessage = 'Dosya yükleme hatası'
            const responseText = await uploadResponse.text()
            console.error('Upload response:', responseText)
            
            try {
              const error = JSON.parse(responseText)
              errorMessage = error.error || errorMessage
            } catch (e) {
              errorMessage = responseText || errorMessage
            }
            
            throw new Error(errorMessage)
          }

          const uploadResult = await uploadResponse.json()
          mediaUrl = uploadResult.url
        }
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
        alert('Medya başarıyla yüklendi!')
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

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleEdit = (item: Media) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      url: item.url,
      alt: item.alt || '',
      type: item.type
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const response = await fetch(`/api/media/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          alt: formData.alt,
          url: formData.url
        }),
      })

      if (response.ok) {
        setEditingItem(null)
        setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
        fetchMedia()
        alert('Medya başarıyla güncellendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Güncelleme sırasında bir hata oluştu')
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Güncelleme sırasında bir hata oluştu')
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
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/admin/galeri/youtube-upload'}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            YouTube Video Ekle
          </button>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showUploadForm ? 'İptal' : 'Yeni Medya Ekle'}
          </button>
        </div>
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
                Medya Türü *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'IMAGE' | 'VIDEO' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IMAGE">Resim</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>

            {formData.type === 'VIDEO' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Dosyası Seç
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      setFormData({ ...formData, url: '' }) // URL'yi temizle
                    } else {
                      setSelectedFile(null)
                    }
                  }}
                  accept="video/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Desteklenen formatlar: MP4, MOV, AVI, WMV, FLV, WebM (Maks. 500MB)
                </div>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">📁 Seçilen dosya: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosya Seç
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      setFormData({ ...formData, url: '' }) // URL'yi temizle
                    } else {
                      setSelectedFile(null)
                    }
                  }}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-500">
                  Desteklenen formatlar: JPG, PNG, GIF, WebP
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veya URL Girin
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Metin
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="Görsel açıklaması"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor...' : 'Yükle'}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.type === 'IMAGE' ? (
              <img
                src={item.url}
                alt={item.alt || item.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div 
                className="w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setPreviewVideo(item)}
              >
                {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">YouTube Video</p>
                    <p className="text-xs text-gray-500 mt-1">{item.title}</p>
                    <p className="text-xs text-blue-600 mt-1">İzlemek için tıklayın</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
                          <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.alt && <p className="text-gray-600 text-sm mb-2">{item.alt}</p>}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    {item.type === 'VIDEO' ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                        {item.source === 'youtube' ? 'YouTube Video' : 'Video'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                        Resim
                      </>
                    )}
                  </span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Düzenle
                  </button>
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

      {media.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz medya dosyası yüklenmemiş.</p>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{previewVideo.title}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {previewVideo.url.includes('youtube.com') || previewVideo.url.includes('youtu.be') ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(previewVideo.url)}`}
                    title={previewVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={previewVideo.url}
                  controls
                  className="w-full max-h-[60vh]"
                  autoPlay
                />
              )}
              {previewVideo.alt && (
                <p className="mt-4 text-gray-600">{previewVideo.alt}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Medya Düzenle</h3>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
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
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">URL değiştirilemez</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  placeholder="Medya açıklaması"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medya Türü
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {editingItem.type === 'VIDEO' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                      Video
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      Resim
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 