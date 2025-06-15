"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function EditProject() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    content: '',
    images: [],
    features: []
  })
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/projeler?id=${id}`)
      .then(res => res.json())
      .then((project) => {
        if (project) {
          setFormData({
            ...project,
            features: Array.isArray(project.features) ? project.features.join(', ') : ''
          })
          setImages(Array.isArray(project.images) ? project.images : [])
          setCoverImage(project.coverImage || (Array.isArray(project.images) ? project.images[0] : null))
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Proje yüklenirken hata:', error)
        setLoading(false)
      })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/projeler', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: Number(id),
          images,
          coverImage: coverImage || images[0] || '',
          features: typeof formData.features === 'string' ? formData.features.split(',').map((f: string) => f.trim()).filter(Boolean) : []
        }),
      })
      if (!response.ok) throw new Error('Proje güncellenirken bir hata oluştu')
      router.push('/admin/projeler')
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Proje güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
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
    setImages(prev => {
      const newImages = [...prev, ...uploaded]
      if (!coverImage && newImages.length > 0) setCoverImage(newImages[0])
      return newImages
    })
  }

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img !== url))
    if (coverImage === url) {
      setCoverImage(images[0] || null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Proje Düzenle: {formData?.title || id}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Başlık" value={formData.title} onChange={handleChange} required className="border p-2 rounded w-full" />
        <input type="text" name="slug" placeholder="Slug (url)" value={formData.slug} onChange={handleChange} required className="border p-2 rounded w-full" />
        <textarea name="description" placeholder="Açıklama" value={formData.description} onChange={handleChange} required className="border p-2 rounded w-full" />
        <textarea name="content" placeholder="İçerik" value={formData.content} onChange={handleChange} className="border p-2 rounded w-full" />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="border p-2 rounded w-full" />
        
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="Yüklenen görsel" className="max-h-32 border-2" style={{ borderColor: coverImage === img ? 'blue' : 'transparent' }} />
                <button type="button" onClick={() => setCoverImage(img)} className={`absolute top-0 left-0 bg-white text-xs px-2 py-1 rounded-br ${coverImage === img ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{coverImage === img ? 'Kapak' : 'Kapak Yap'}</button>
                <button type="button" onClick={() => handleRemoveImage(img)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
              </div>
            ))}
          </div>
        )}
        
        <textarea name="features" placeholder="Özellikler (virgül ile ayırarak yazın: Özellik1, Özellik2, ... )" value={formData.features} onChange={handleChange} className="border p-2 rounded w-full" />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{loading ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </div>
  )
} 