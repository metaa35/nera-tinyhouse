'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function EKatalogAdmin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pdfExists, setPdfExists] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/admin/login')
      return
    }

    checkPdfExists()
    setLoading(false)
  }, [session, status, router])

  const checkPdfExists = async () => {
    try {
      const response = await fetch('/api/e-katalog')
      const data = await response.json()
      setPdfExists(data.exists)
      setPdfUrl(data.url || null)
    } catch (error) {
      console.error('PDF kontrol hatası:', error)
      setPdfExists(false)
      setPdfUrl(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    } else {
      alert('Lütfen sadece PDF dosyası seçin')
    }
  }

  const handleUpload = async () => {
    if (!pdfFile) {
      alert('Lütfen bir PDF dosyası seçin')
      return
    }

    setUploading(true)
    
    try {
      await uploadDirectToCloudinary(pdfFile)
    } catch (error) {
      console.error('PDF yüklenirken hata:', error)
      alert('PDF yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const uploadDirectToCloudinary = async (file: File) => {
    try {
      // Basit upload - dosyayı public klasörüne kopyala
      const formData = new FormData()
      formData.append('pdf', file)

      const uploadResponse = await fetch('/api/e-katalog', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload hatası')
      }

      // Başarılı
      alert('PDF başarıyla yüklendi!')
      setPdfFile(null)
      setPdfExists(true)
      setPdfUrl('/katalog.pdf')
      
      // Input'u temizle
      const fileInput = document.getElementById('pdf-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Upload hatası:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">E-Katalog Yönetimi</h1>
          <p className="text-gray-600">
            Ürün kataloğu PDF dosyasını yükleyin. Mevcut dosya otomatik olarak değiştirilecektir.
          </p>
        </div>

        {/* PDF Yükleme Alanı */}
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF Katalog Yükle</h2>
              
              {/* Dosya Seçimi */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Dosyası Seçin
                </label>
                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                                 <p className="text-sm text-gray-500 mt-1">
                   Sadece PDF dosyaları kabul edilir (Maksimum 50MB, dosya sistemi üzerinden yüklenir)
                 </p>
              </div>

              {/* Seçilen Dosya Bilgisi */}
              {pdfFile && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{pdfFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Yükleme Butonu */}
              <button
                onClick={handleUpload}
                disabled={!pdfFile || uploading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  !pdfFile || uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Yükleniyor...
                  </div>
                ) : (
                  'PDF\'i Yükle'
                )}
              </button>
            </div>

            {/* Mevcut PDF Bilgisi */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Katalog</h3>
              {pdfExists ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">katalog.pdf</p>
                      <p className="text-sm text-gray-600">Katalog mevcut ve erişilebilir</p>
                    </div>
                  </div>
                                     <a
                     href={pdfUrl || '#'}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                   >
                     Görüntüle
                   </a>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Katalog Yok</p>
                      <p className="text-sm text-gray-600">Henüz katalog yüklenmemiş</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bilgi Kartları */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Otomatik Güncelleme</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Yeni PDF yüklediğinizde eski dosya otomatik olarak değiştirilir.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Anında Erişim</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Yüklenen katalog anında ziyaretçiler tarafından görüntülenebilir.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Kolay İndirme</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Ziyaretçiler kataloğu kolayca indirebilir ve paylaşabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 