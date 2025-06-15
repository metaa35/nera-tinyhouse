"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import Link from 'next/link'

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/projeler')
      .then(res => res.json())
      .then(data => setProjects(data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return
    await fetch('/api/projeler', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tarih belirtilmemiş'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Geçersiz tarih'
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Geçersiz tarih'
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Projeler
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tüm projeleri buradan yönetebilirsiniz
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/projeler/yeni"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Yeni Proje
          </Link>
        </div>
      </div>

      {/* Proje Listesi */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {projects.filter(Boolean).map((project) => (
            <li key={project.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {project.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {project.imageCount} Görsel
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Link
                      href={`/admin/projeler/${project.id}/duzenle`}
                      className="font-medium text-blue-600 hover:text-blue-500 mr-4"
                    >
                      Düzenle
                    </Link>
                    <Link
                      href={`/projeler/${project.slug}`}
                      className="font-medium text-green-600 hover:text-green-500 mr-4"
                      target="_blank"
                    >
                      Detayları Gör
                    </Link>
                    <button
                      type="button"
                      className="font-medium text-red-600 hover:text-red-500"
                      onClick={() => handleDelete(project.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p>
                      Eklenme:{' '}
                      <time dateTime={project.createdAt}>
                        {formatDate(project.createdAt)}
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 