'use client'

import { useEffect } from 'react'
import SimpleVideoPlayer from './SimpleVideoPlayer'
import YouTubeVideoPlayer from './YouTubeVideoPlayer'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
  source?: string
}

export default function VideoModal({ isOpen, onClose, videoUrl, title, source }: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors duration-200"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video Container */}
      <div className="relative w-full max-w-6xl mx-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {source === 'youtube' ? (
            <YouTubeVideoPlayer
              videoId={videoUrl}
              title={title}
              className="w-full h-full"
            />
          ) : (
            <SimpleVideoPlayer
              url={videoUrl}
              title={title}
              className="w-full h-full"
            />
          )}
        </div>
        
        {/* Title */}
        {title && (
          <div className="absolute bottom-4 left-4 right-4 text-white text-center">
            <h3 className="text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              {title}
            </h3>
          </div>
        )}
      </div>
    </div>
  )
} 