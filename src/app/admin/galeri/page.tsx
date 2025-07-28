"use client"

import { useState, useEffect } from 'react'

interface Media {
  id: number
  title: string
  url: string
  alt?: string
  type: 'IMAGE' | 'VIDEO'
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
              <video
                src={item.url}
                controls
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              {item.alt && <p className="text-gray-600 text-sm mb-2">{item.alt}</p>}
              <p className="text-gray-500 text-xs mb-3">
                {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </p>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz medya dosyası yüklenmemiş.</p>
        </div>
      )}
    </div>
  )
} 