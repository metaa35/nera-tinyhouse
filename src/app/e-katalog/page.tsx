'use client'

import { useState, useEffect } from 'react'

export default function EKatalog() {
  const [pdfExists, setPdfExists] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // PDF dosyasının varlığını kontrol et
    checkPdfExists()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#2D3436]">
              E-Katalog
            </h1>
            <p className="text-xl text-[#636E72] mb-12">
              Bayiliğini aldığımız firmaların ürün kataloğunu inceleyin. 
              Tente, pergola ve cam sistemleri için profesyonel çözümler.
            </p>
          </div>
        </div>
      </section>

      {/* PDF Görüntüleyici */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {loading ? (
                <div className="mb-8">
                  <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-[#FF6B6B] mx-auto mb-4"></div>
                  <p className="text-[#636E72]">Yükleniyor...</p>
                </div>
              ) : pdfExists ? (
                <>
                  <div className="mb-8">
                    <svg className="w-24 h-24 text-[#FF6B6B] mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl font-bold text-[#2D3436] mb-4">
                      Ürün Kataloğu
                    </h2>
                    <p className="text-[#636E72] mb-6">
                      Bayiliğini aldığımız firmaların tüm ürünlerini detaylı olarak inceleyebilirsiniz.
                    </p>
                  </div>

                  {/* PDF İndirme Butonu */}
                  <div className="space-y-4">
                    <a
                      href={pdfUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center px-8 py-4 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all duration-300 font-medium text-lg"
                    >
                      <span className="relative z-10 flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Kataloğu Görüntüle
                      </span>
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </a>
                    
                    <p className="text-sm text-[#636E72]">
                      PDF dosyası yeni sekmede açılacaktır
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <svg className="w-24 h-24 text-[#636E72] mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl font-bold text-[#2D3436] mb-4">
                      Katalog Henüz Yüklenmedi
                    </h2>
                    <p className="text-[#636E72] mb-6">
                      Ürün kataloğu henüz yüklenmemiş. Lütfen daha sonra tekrar deneyin veya bizimle iletişime geçin.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#FF6B6B]/10 rounded-lg border border-[#FF6B6B]/20">
                      <p className="text-[#636E72] text-sm">
                        Katalog yüklenmesi için admin panelinden "E-Katalog" bölümüne giderek PDF dosyasını yükleyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Özellikler */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[#2D3436] mb-2">Detaylı Bilgiler</h3>
                  <p className="text-sm text-[#636E72]">Tüm ürün özellikleri ve teknik detaylar</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[#2D3436] mb-2">Güncel Fiyatlar</h3>
                  <p className="text-sm text-[#636E72]">Güncel fiyat listesi ve kampanyalar</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[#2D3436] mb-2">Kolay İndirme</h3>
                  <p className="text-sm text-[#636E72]">PDF formatında kolay indirme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-[#2D3436]">
              Özel Fiyat Teklifi Alın
            </h2>
            <p className="text-xl mb-12 text-[#636E72]">
              Katalogdaki ürünler hakkında detaylı bilgi almak ve özel fiyat teklifi için bizimle iletişime geçin.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="/iletisim"
                className="group relative px-8 py-4 bg-[#FF6B6B] text-white font-medium hover:bg-[#FF5252] transition-all duration-300"
              >
                <span className="relative z-10">İletişime Geç</span>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              <a
                href="tel:+905555555555"
                className="group relative px-8 py-4 bg-[#2D3436] text-white font-medium hover:bg-[#636E72] transition-all duration-300"
              >
                <span className="relative z-10">Hemen Ara</span>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 