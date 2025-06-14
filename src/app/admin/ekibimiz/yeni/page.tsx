"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTeamMember() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    description: '',
    photo: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
    const data = await res.json()
    if (data.url) {
      setFormData(prev => ({ ...prev, photo: data.url }))
    } else {
      alert('Fotoğraf yüklenemedi!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.photo) {
      alert('Lütfen bir fotoğraf yükleyin!')
      return
    }
    setIsLoading(true)
    try {
      await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      router.push('/admin/ekibimiz')
    } catch {
      alert('Üye eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Yeni Ekip Üyesi</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg p-6 grid grid-cols-1 gap-6">
          <input type="text" name="name" placeholder="İsim" value={formData.name} onChange={handleChange} required className="border p-2 rounded" />
          <input type="text" name="position" placeholder="Pozisyon" value={formData.position} onChange={handleChange} required className="border p-2 rounded" />
          <textarea name="description" placeholder="Açıklama" value={formData.description} onChange={handleChange} className="border p-2 rounded" />
          <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded" />
          {formData.photo && <img src={formData.photo} alt="Yüklenen fotoğraf" className="max-h-32 mt-2 rounded-full" />}
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
          <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{isLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      </form>
    </div>
  )
} 