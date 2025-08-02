'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

export default function VideoPlayer({ url, title, className = '' }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

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

  if (isYouTube) {
    const embedUrl = getEmbedUrl(url)
    // YouTube parametrelerini ekle
    const enhancedUrl = `${embedUrl}?modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0`
    
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={enhancedUrl}
          title={title || 'Video'}
          className="w-full h-full min-h-[400px] rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    )
  }

  // Normal video dosyası
  return (
    <div className={`relative ${className}`}>
      <video
        controls
        className="w-full h-full min-h-[400px] rounded-lg"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={url} type="video/mp4" />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
} 