'use client'

import { useState } from 'react'

interface SimpleVideoPlayerProps {
  url: string
  title?: string
  className?: string
}

export default function SimpleVideoPlayer({ url, title, className = '' }: SimpleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // YouTube URL'sini embed formatına çevir
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed')) return url
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    return url
  }

  // YouTube URL'si mi kontrol et
  const isYouTube = url.includes('youtube.com/embed') || url.includes('youtu.be') || url.includes('youtube.com/watch')

  // YouTube video ID'sini al
  const getVideoId = (url: string) => {
    if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1]
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]
    }
    if (url.includes('youtube.com/watch')) {
      return url.split('v=')[1]?.split('&')[0]
    }
    return null
  }

  const videoId = getVideoId(url)
  const defaultThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''

  if (isYouTube && !isPlaying) {
    return (
      <div className={`relative ${className} group cursor-pointer`} onClick={() => setIsPlaying(true)}>
        {/* Thumbnail */}
        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
          <img
            src={defaultThumbnail}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
          <div className="w-16 h-16 bg-white bg-opacity-95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Video Title */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-medium text-sm">{title}</h3>
          </div>
        )}
      </div>
    )
  }

  if (isYouTube && isPlaying) {
    const embedUrl = getEmbedUrl(url)
    // YouTube başlığını gizlemek için özel parametreler
    const enhancedUrl = `${embedUrl}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&origin=${window.location.origin}`
    
    return (
      <div className={`relative ${className} bg-black rounded-lg overflow-hidden shadow-lg`}>
        <iframe
          src={enhancedUrl}
          title={title || 'Video'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // Normal video dosyası
  return (
    <div className={`relative ${className} bg-black rounded-lg overflow-hidden shadow-lg`}>
      <video
        controls
        className="w-full h-full"
      >
        <source src={url} type="video/mp4" />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
    </div>
  )
} 