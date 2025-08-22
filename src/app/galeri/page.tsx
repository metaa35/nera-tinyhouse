"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer'
import YouTubeVideoPlayer from '@/components/YouTubeVideoPlayer'
import ImageModal from '@/components/ImageModal'
import VideoModal from '@/components/VideoModal'

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

export default function GaleriPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; alt: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; source?: string } | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

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

  const handleImageClick = (image: Media, index: number) => {
    setSelectedImage({
      url: image.url,
      title: image.title,
      alt: image.alt || image.title
    })
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage({
        url: images[newIndex].url,
        title: images[newIndex].title,
        alt: images[newIndex].alt || images[newIndex].title
      })
    } else {
      const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      setSelectedImage({
        url: images[newIndex].url,
        title: images[newIndex].title,
        alt: images[newIndex].alt || images[newIndex].title
      })
    }
  }

  const handleVideoClick = (video: Media) => {
    setSelectedVideo({
      url: video.url,
      title: video.title,
      source: video.source
    })
    setIsVideoModalOpen(true)
  }

  const closeVideoModal = () => {
    setIsVideoModalOpen(false)
    setSelectedVideo(null)
  }

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
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => handleImageClick(image, index)}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || image.title}
                        width={800}
                        height={600}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={85}
                        unoptimized={image.url.startsWith('http') || image.url.startsWith('data:')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                        <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-semibold text-sm">{image.title}</h3>
                        </div>
                      </div>
                      {/* Zoom Icon */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black bg-opacity-70 rounded-lg p-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Video Player */}
                      <div className="relative aspect-video cursor-pointer" onClick={() => handleVideoClick(video)}>
                        {video.source === 'youtube' ? (
                          <YouTubeVideoPlayer
                            videoId={video.url}
                            title={video.title}
                            className="w-full h-full"
                            thumbnail={video.thumbnail}
                            onFullscreen={() => handleVideoClick(video)}
                          />
                        ) : (
                          <SimpleVideoPlayer
                            url={video.url}
                            title={video.title}
                            className="w-full h-full"
                          />
                        )}
                        {/* Fullscreen Icon */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black bg-opacity-70 rounded-lg p-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Video
                          </span>
                          <span>
                            {new Date(video.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          alt={selectedImage.alt}
          images={images.map(img => ({
            url: img.url,
            title: img.title,
            alt: img.alt || img.title
          }))}
          currentIndex={currentImageIndex}
          onNavigate={handleNavigate}
        />
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={closeVideoModal}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          source={selectedVideo.source}
        />
      )}
    </div>
  )
} 