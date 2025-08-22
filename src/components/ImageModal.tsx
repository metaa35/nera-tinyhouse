'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title?: string
  alt?: string
  images?: Array<{ url: string; title?: string; alt?: string }>
  currentIndex?: number
  onNavigate?: (direction: 'prev' | 'next') => void
}

export default function ImageModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title, 
  alt,
  images,
  currentIndex = 0,
  onNavigate
}: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex)

  useEffect(() => {
    setCurrentImageIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleArrowKeys)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrowKeys)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handlePrev = () => {
    if (images && images.length > 1) {
      if (onNavigate) {
        onNavigate('prev')
      } else {
        const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
        setCurrentImageIndex(newIndex)
      }
    }
  }

  const handleNext = () => {
    if (images && images.length > 1) {
      if (onNavigate) {
        onNavigate('next')
      } else {
        const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
        setCurrentImageIndex(newIndex)
      }
    }
  }

  const currentImage = images && images.length > 0 
    ? images[currentImageIndex] 
    : { url: imageUrl, title, alt }

  const showNavigation = images && images.length > 1

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors duration-200"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || currentImage.title || 'Modal image'}
          width={0}
          height={0}
          sizes="100vw"
          className="max-w-full max-h-full object-contain w-auto h-auto"
          priority
          quality={100}
          unoptimized={currentImage.url.startsWith('http') || currentImage.url.startsWith('data:')}
        />
        
        {/* Title */}
        {currentImage.title && (
          <div className="absolute bottom-4 left-4 right-4 text-white text-center">
            <h3 className="text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              {currentImage.title}
            </h3>
          </div>
        )}

        {/* Image Counter */}
        {showNavigation && (
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
            <button 
              onClick={handlePrev}
              className="text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
            <button 
              onClick={handleNext}
              className="text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 