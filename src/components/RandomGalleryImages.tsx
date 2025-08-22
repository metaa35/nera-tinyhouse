"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { fetchGalleryMedia, getUniqueRandomImages } from '@/utils/media'

interface RandomGalleryImagesProps {
  count?: number
  className?: string
  showTitle?: boolean
}

export default function RandomGalleryImages({ 
  count = 3, 
  className = "",
  showTitle = false 
}: RandomGalleryImagesProps) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRandomImages()
  }, [count])

  const loadRandomImages = async () => {
    setLoading(true)
    try {
      await fetchGalleryMedia()
      const randomImages = getUniqueRandomImages(count)
      setImages(randomImages)
    } catch (error) {
      console.error('Rastgele görseller yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Image
            src={image.url}
            alt={image.alt || image.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showTitle && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
              <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-semibold text-sm">{image.title}</h3>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 