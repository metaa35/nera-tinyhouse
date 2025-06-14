'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewBlog() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const uploaded: string[] = []
    for (const file of files) {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (data.url) uploaded.push(data.url)
    }
    setImages(prev => [...prev, ...uploaded])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      alert('Lütfen en az bir görsel yükleyin!')
      return
    }
    setIsLoading(true)
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images
        })
      })
      router.push('/admin/blog')
    } catch {
      alert('Blog eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Yeni Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg p-6 grid grid-cols-1 gap-6">
          <input type="text" name="title" placeholder="Başlık" value={formData.title} onChange={handleChange} required className="border p-2 rounded" />
          <input type="text" name="slug" placeholder="Slug (url)" value={formData.slug} onChange={handleChange} required className="border p-2 rounded" />
          <textarea name="content" placeholder="İçerik" value={formData.content} onChange={handleChange} required className="border p-2 rounded" />
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="border p-2 rounded" />
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="Yüklenen görsel" className="max-h-32 border-2" />
                  <button type="button" onClick={() => setImages(prev => prev.filter(im => im !== img))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
          <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{isLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      </form>
    </div>
  )
} 