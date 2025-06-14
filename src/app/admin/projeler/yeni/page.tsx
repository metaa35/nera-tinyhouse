'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const defaultFeatures = [
  "Güneş enerjisi sistemi",
  "Kompost tuvalet",
  "İzolasyonlu duvarlar",
  "Yağmur suyu toplama sistemi",
  "Doğal havalandırma",
  "Ahşap dış cephe"
]

export default function NewProject() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    location: '',
    image: '',
    features: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/projeler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          area: Number(formData.area),
          images,
          coverImage: coverImage || images[0] || '',
          features: formData.features.split(',').map(f => f.trim())
        }),
      })
      if (!response.ok) throw new Error('Proje eklenirken bir hata oluştu')
      const data = await response.json()
      if (data.project && data.project.id) {
        router.push(`/admin/projeler/${data.project.id}/duzenle`)
      } else {
      router.push('/admin/projeler')
      }
    } catch (error) {
      alert('Proje eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Yeni Proje</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg p-6 grid grid-cols-1 gap-6">
          <input type="text" name="title" placeholder="Başlık" value={formData.title} onChange={handleChange} required className="border p-2 rounded" />
          <textarea name="description" placeholder="Açıklama" value={formData.description} onChange={handleChange} required className="border p-2 rounded" />
          <input type="number" name="price" placeholder="Fiyat (TL)" value={formData.price} onChange={handleChange} required className="border p-2 rounded" />
          <input type="number" name="area" placeholder="Metrekare" value={formData.area} onChange={handleChange} required className="border p-2 rounded" />
          <input type="text" name="location" placeholder="Konum" value={formData.location} onChange={handleChange} required className="border p-2 rounded" />
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="border p-2 rounded" />
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="Yüklenen görsel" className="max-h-32 border-2" style={{ borderColor: coverImage === img ? 'blue' : 'transparent' }} />
                  <button type="button" onClick={() => setCoverImage(img)} className={`absolute top-0 left-0 bg-white text-xs px-2 py-1 rounded-br ${coverImage === img ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{coverImage === img ? 'Kapak' : 'Kapak Yap'}</button>
                  <button type="button" onClick={() => setImages(prev => prev.filter(im => im !== img))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                </div>
              ))}
            </div>
          )}
          <textarea name="features" placeholder="Özellikler (virgül ile ayırarak yazın: Özellik1, Özellik2, ... )" value={formData.features} onChange={handleChange} className="border p-2 rounded" />
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
          <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{isLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      </form>
    </div>
  )
} 