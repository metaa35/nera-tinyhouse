"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any | null>(null)
  useEffect(() => {
    fetch(`/api/projeler?id=${params.id}`)
      .then(res => res.json())
      .then((data) => {
        setProject(data || null)
      })
  }, [params.id])

  if (!project) return <div className="min-h-screen flex items-center justify-center">Proje bulunamadı veya yükleniyor...</div>

  return (
    <main className="min-h-screen py-20">
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
            {project.images && project.images.length > 0 && (
              <>
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image
                    src={project.coverImage || project.images[0]}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {project.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-4">
                    {project.images.filter((img: string) => img !== (project.coverImage || project.images[0])).map((image: string, index: number) => (
                      <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${project.title} - Görsel ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sağ Kolon - Detaylar */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-600 mb-6">{project.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Metrekare</div>
                <div className="text-xl font-semibold">{project.area}m²</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Konum</div>
                <div className="text-xl font-semibold">{project.location}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Fiyat</div>
                <div className="text-xl font-semibold">{project.price?.toLocaleString('tr-TR')} TL</div>
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
    </main>
  )
} 