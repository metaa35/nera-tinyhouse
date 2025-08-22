"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ImageModal from '@/components/ImageModal'

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params && typeof params.slug === 'string' ? params.slug : ''
  const [project, setProject] = useState<any | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; alt: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/projeler?slug=${slug}`)
      .then(res => res.json())
      .then((data) => {
        setProject(data || null)
      })
  }, [slug])

  if (!project) return <div className="min-h-screen flex items-center justify-center">Proje bulunamadı veya yükleniyor...</div>

  const handleImageClick = (imageUrl: string, title: string, alt?: string, index?: number) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      alt: alt || title
    })
    if (index !== undefined) {
      setCurrentImageIndex(index)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const allImages = project.images && project.images.length > 0 
      ? [project.coverImage || project.images[0], ...project.images.filter((img: string) => img !== (project.coverImage || project.images[0]))]
      : [project.coverImage || project.image]
    
    if (direction === 'prev') {
      const newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage({
        url: allImages[newIndex] || '/placeholder.jpg',
        title: newIndex === 0 ? project.title : `${project.title} - Görsel ${newIndex + 1}`,
        alt: newIndex === 0 ? project.title : `${project.title} - Görsel ${newIndex + 1}`
      })
    } else {
      const newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      setSelectedImage({
        url: allImages[newIndex] || '/placeholder.jpg',
        title: newIndex === 0 ? project.title : `${project.title} - Görsel ${newIndex + 1}`,
        alt: newIndex === 0 ? project.title : `${project.title} - Görsel ${newIndex + 1}`
      })
    }
  }

  return (
    <main className="min-h-screen py-20 bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/projeler"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projelere Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sol Kolon - Görseller */}
          <div className="space-y-4">
            {project.images && project.images.length > 0 ? (
              <>
                <div className="relative h-96 rounded-lg overflow-hidden cursor-pointer">
                                     <Image
                     src={project.coverImage || project.images[0] || '/placeholder.jpg'}
                     alt={project.title}
                     fill
                     className="object-cover hover:scale-105 transition-transform duration-300"
                     onClick={() => handleImageClick(project.coverImage || project.images[0] || '/placeholder.jpg', project.title, undefined, 0)}
                     quality={85}
                     unoptimized={(project.coverImage || project.images[0] || '/placeholder.jpg')?.startsWith('http') || (project.coverImage || project.images[0] || '/placeholder.jpg')?.startsWith('data:')}
                   />
                  {/* Zoom Icon */}
                  <div className="absolute top-3 right-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black bg-opacity-70 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                                  {project.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-4">
                      {project.images.filter((img: string) => img !== (project.coverImage || project.images[0])).map((image: string, index: number) => (
                        <div key={index} className="relative h-32 rounded-lg overflow-hidden cursor-pointer">
                                                     <Image
                             src={image || '/placeholder.jpg'}
                             alt={`${project.title} - Görsel ${index + 2}`}
                             fill
                             className="object-cover hover:scale-105 transition-transform duration-300"
                             onClick={() => handleImageClick(image || '/placeholder.jpg', `${project.title} - Görsel ${index + 2}`, undefined, index + 1)}
                             quality={85}
                             unoptimized={(image || '/placeholder.jpg')?.startsWith('http') || (image || '/placeholder.jpg')?.startsWith('data:')}
                           />
                          {/* Zoom Icon */}
                          <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black bg-opacity-70 rounded p-1">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Görsel Yok</span>
              </div>
            )}
          </div>

          {/* Sağ Kolon - Detaylar */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-600 mb-6">{project.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Metrekare</div>
                <div className="text-xl font-semibold">{project.area ? `${project.area}m²` : '-'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Konum</div>
                <div className="text-xl font-semibold">{project.location || '-'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Fiyat</div>
                <div className="text-xl font-semibold">{project.price ? `${project.price.toLocaleString('tr-TR')} TL` : '-'}</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Özellikler</h2>
              <ul className="grid grid-cols-2 gap-2">
                {project.features && project.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
              İletişime Geç
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          alt={selectedImage.alt}
          images={(() => {
            const allImages = project.images && project.images.length > 0 
              ? [project.coverImage || project.images[0], ...project.images.filter((img: string) => img !== (project.coverImage || project.images[0]))]
              : [project.coverImage || project.image]
            return allImages.map((img, index) => ({
              url: img || '/placeholder.jpg',
              title: index === 0 ? project.title : `${project.title} - Görsel ${index + 1}`,
              alt: index === 0 ? project.title : `${project.title} - Görsel ${index + 1}`
            }))
          })()}
          currentIndex={currentImageIndex}
          onNavigate={handleNavigate}
        />
      )}
    </main>
  )
} 