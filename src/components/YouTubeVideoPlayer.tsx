'use client'

import { useState } from 'react'

interface YouTubeVideoPlayerProps {
  videoId: string
  title?: string
  className?: string
  thumbnail?: string
  onFullscreen?: () => void
}

export default function YouTubeVideoPlayer({
  videoId,
  title,
  className = '',
  thumbnail,
  onFullscreen
}: YouTubeVideoPlayerProps) {
  const [isHovered, setIsHovered] = useState(false)

  // YouTube video ID'sini URL'den çıkar
  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : url
  }

  const actualVideoId = extractVideoId(videoId)

  // Thumbnail URL'ini oluştur
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail
    return `https://img.youtube.com/vi/${actualVideoId}/maxresdefault.jpg`
  }

  // YouTube'da aç veya tam ekran
  const handleClick = () => {
    if (onFullscreen) {
      onFullscreen()
    } else {
      window.open(`https://www.youtube.com/watch?v=${actualVideoId}`, '_blank')
    }
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-black cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <img
        src={getThumbnailUrl()}
        alt={title || 'Video thumbnail'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback thumbnail
          const target = e.target as HTMLImageElement
          target.src = `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 group-hover:bg-red-700 text-white rounded-full p-4 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
            <svg 
              className="w-8 h-8 ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* YouTube Icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black bg-opacity-70 rounded-lg p-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>

        {/* Video Title */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white text-sm font-medium truncate">
              {title}
            </h3>
            <p className="text-gray-300 text-xs mt-1">
              YouTube'da izlemek için tıklayın
            </p>
          </div>
        )}
      </div>

      {/* Hover Effect */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none"></div>
      )}
    </div>
  )
} 