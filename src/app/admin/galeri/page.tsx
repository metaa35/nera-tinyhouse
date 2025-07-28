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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setUploadProgress(0)

    try {
      let mediaUrl = formData.url

      // Eğer dosya seçilmişse Cloudinary'ye yükle
      if (selectedFile) {
        if (formData.type === 'VIDEO') {
          // Video dosyaları için progress bar ile upload
          console.log('Video uploading with progress...')
          
          const folder = 'gallery/videos'
          const timestamp = Math.round(new Date().getTime() / 1000)
          
          const params = {
            timestamp,
            folder,
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
            eager: [
              { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
            ]
          }
          
          // Cloudinary signature oluştur
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
          
          // Progress bar ile upload
          const xhr = new XMLHttpRequest()
          
          return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100
                setUploadProgress(percentComplete)
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`)
              }
            })
            
            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                try {
                  const result = JSON.parse(xhr.responseText)
                  mediaUrl = result.secure_url
                  console.log('Video uploaded successfully:', mediaUrl)
                  resolve(mediaUrl)
                } catch (error) {
                  reject(new Error('Upload response parse hatası'))
                }
              } else {
                reject(new Error(`Upload failed: ${xhr.status}`))
              }
            })
            
            xhr.addEventListener('error', () => {
              reject(new Error('Upload network hatası'))
            })
            
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('timestamp', timestamp.toString())
            formData.append('signature', signatureData.signature)
            formData.append('api_key', signatureData.api_key)
            formData.append('folder', folder)
            formData.append('resource_type', 'video')
            formData.append('eager', JSON.stringify([
              { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
            ]))
            
            xhr.open('POST', signatureData.uploadUrl)
            xhr.send(formData)
          }).then(async (uploadedUrl) => {
            // Medya kaydını oluştur
            const response = await fetch('/api/media', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...formData,
                url: uploadedUrl
              }),
            })

            if (response.ok) {
              setFormData({ title: '', url: '', alt: '', type: 'IMAGE' })
              setSelectedFile(null)
              setShowUploadForm(false)
              setUploadProgress(0)
              fetchMedia()
              alert('Video başarıyla yüklendi!')
            } else {
              const error = await response.json()
              alert(error.error || 'Bir hata oluştu')
            }
          })
          
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

      // Resim dosyaları için medya kaydını oluştur
      if (formData.type === 'IMAGE') {
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
                {uploading && uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Yükleniyor...</span>
                      <span>{uploadProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
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