"use client"
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function EditBlog() {
  const router = useRouter()
  const params = useParams()
  const { slug } = params
  const [formData, setFormData] = useState<any | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then((blogs) => {
        const blog = blogs.find((b: any) => b.slug === slug)
        if (blog) {
          setFormData({
            ...blog
          })
          setImages(Array.isArray(blog.images) ? blog.images : (blog.image ? [blog.image] : []))
          setCoverImage(blog.coverImage || (Array.isArray(blog.images) ? blog.images[0] : null))
        }
      })
  }, [slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
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

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img !== url))
    if (coverImage === url) setCoverImage(images[0] || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images
        })
      })
      router.push('/admin/blog')
    } catch {
      alert('Blog güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!formData) return <div>Yükleniyor...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blog Düzenle: {slug}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Başlık" value={formData.title} onChange={handleChange} required className="border p-2 rounded w-full" />
        <input type="text" name="slug" placeholder="Slug (url)" value={formData.slug} onChange={handleChange} required className="border p-2 rounded w-full" />
        <textarea name="content" placeholder="İçerik" value={formData.content} onChange={handleChange} required className="border p-2 rounded w-full" />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="border p-2 rounded w-full" />
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="Yüklenen görsel" className="max-h-32 border-2" />
                <button type="button" onClick={() => handleRemoveImage(img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{loading ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </div>
  )
} 