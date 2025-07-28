"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Media {
  id: number
  title: string
  url: string
  alt?: string
  type: 'IMAGE' | 'VIDEO'
  createdAt: string
}

export default function GaleriPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')

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

  const images = media.filter(item => item.type === 'IMAGE')
  const videos = media.filter(item => item.type === 'VIDEO')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <section className="relative py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="h-16 bg-gray-200 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="flex justify-center mb-12">
                <div className="h-12 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#2D3436]">
              Galeri
            </h1>
            <p className="text-xl text-[#636E72] mb-12">
              Projelerimizden seçilen görseller ve videolar ile tiny house yaşamının güzelliklerini keşfedin.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('images')}
                className={`px-8 py-3 rounded-md transition-all duration-300 font-medium ${
                  activeTab === 'images'
                    ? 'bg-[#FF6B6B] text-white shadow-sm'
                    : 'text-[#636E72] hover:text-[#2D3436] hover:bg-gray-50'
                }`}
              >
                Fotoğraflar ({images.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-8 py-3 rounded-md transition-all duration-300 font-medium ${
                  activeTab === 'videos'
                    ? 'bg-[#FF6B6B] text-white shadow-sm'
                    : 'text-[#636E72] hover:text-[#2D3436] hover:bg-gray-50'
                }`}
              >
                Videolar ({videos.length})
              </button>
            </div>
          </div>

          {activeTab === 'images' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-[#2D3436]">
                Fotoğraflar
              </h2>
              {images.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#636E72] text-xl">
                    Henüz fotoğraf yüklenmemiş.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || image.title}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                        <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-semibold text-sm">{image.title}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-[#2D3436]">
                Videolar
              </h2>
              {videos.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#636E72] text-xl">
                    Henüz video yüklenmemiş.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <video
                        src={video.url}
                        className="w-full h-64 object-cover"
                        controls
                        poster={video.url.replace('.mp4', '.jpg')}
                      />
                      <div className="p-4 bg-white">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
} 