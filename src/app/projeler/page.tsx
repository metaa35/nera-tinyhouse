"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ImageModal from '@/components/ImageModal'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; alt: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetch('/api/projeler')
      .then(res => res.json())
      .then(data => setProjects(data))
  }, [])

  const handleImageClick = (imageUrl: string, title: string, index: number) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      alt: title
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
      const newIndex = currentImageIndex === 0 ? projects.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      const project = projects[newIndex]
      setSelectedImage({
        url: project.coverImage || project.image,
        title: project.title,
        alt: project.title
      })
    } else {
      const newIndex = currentImageIndex === projects.length - 1 ? 0 : currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      const project = projects[newIndex]
      setSelectedImage({
        url: project.coverImage || project.image,
        title: project.title,
        alt: project.title
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#2D3436]">
              Hayalinizdeki Tiny House'u Keşfedin
            </h1>
            <p className="text-xl text-[#636E72] mb-12">
              Her biri özgün, sürdürülebilir ve fonksiyonel tiny house projelerimizi inceleyin. Doğayla bütünleşen yaşam alanları sizi bekliyor.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div 
                key={index}
                className="group relative bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64">
                                     <Image
                     src={project.coverImage || project.image}
                     alt={project.title}
                     fill
                     className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                     onClick={() => handleImageClick(project.coverImage || project.image, project.title, index)}
                     quality={85}
                     unoptimized={(project.coverImage || project.image)?.startsWith('http') || (project.coverImage || project.image)?.startsWith('data:')}
                   />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Zoom Icon */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black bg-opacity-70 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#2D3436]">
                    {project.title}
                  </h3>
                  <p className="text-[#636E72] mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.features && project.features.map((feature: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={`/projeler/${project.slug}`}
                    className="inline-flex items-center text-[#FF6B6B] hover:text-[#FF5252] transition-colors duration-300"
                  >
                    Detayları Gör
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-[#2D3436]">
              Hayalini Birlikte Tasarlayalım
            </h2>
            <p className="text-xl mb-12 text-[#636E72]">
              Modern tasarım, kaliteli malzeme ve uzman ekibimizle, sürdürülebilir ve konforlu bir tiny house yaşamı için buradayız.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                href="/iletisim"
                className="group relative px-8 py-4 bg-[#FF6B6B] text-white font-medium hover:bg-[#FF5252] transition-all duration-300"
              >
                <span className="relative z-10">Ücretsiz Keşif</span>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link 
                href="/iletisim"
                className="group relative px-8 py-4 border-2 border-[#FF6B6B] text-[#FF6B6B] font-medium hover:bg-[#FF6B6B] hover:text-white transition-all duration-300"
              >
                <span className="relative z-10">İletişime Geç</span>
              </Link>
            </div>
          </div>
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
          images={projects.map(project => ({
            url: project.coverImage || project.image,
            title: project.title,
            alt: project.title
          }))}
          currentIndex={currentImageIndex}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  )
} 