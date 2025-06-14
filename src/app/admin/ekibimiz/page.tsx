import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeamMember } from '@/types/team';

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [photo, setPhoto] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
  }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setPhoto(data.url)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editId !== null) {
      // Düzenleme
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, name, role, photo }),
      })
      const updated = await res.json()
      setTeam(team.map(m => m.id === editId ? updated.member : m))
      setEditId(null)
    } else {
      // Ekleme
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, photo }),
      })
      const data = await res.json()
      setTeam([...team, data.member])
    }
    setName("")
    setRole("")
    setPhoto("")
    setLoading(false)
  }

  const handleEdit = (member: TeamMember) => {
    setEditId(member.id)
    setName(member.name)
    setRole(member.role)
    setPhoto(member.photo)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ekip üyesini silmek istediğinize emin misiniz?')) return
    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTeam(team.filter(m => m.id !== id))
    setEditId(null)
    setName("")
    setRole("")
    setPhoto("")
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Ekibimiz Yönetimi</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block font-medium mb-1">İsim</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Pozisyon</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Fotoğraf</label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          {uploading && <span className="ml-2 text-blue-600 text-sm">Yükleniyor...</span>}
          {photo && <img src={photo} alt="Yüklenen" className="w-16 h-16 rounded-full object-cover mt-2" />}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-[#FF6B6B] text-white rounded hover:bg-[#ff5252] transition"
          disabled={loading}
        >
          {editId !== null ? "Kaydet" : "Ekle"}
        </button>
        {editId !== null && (
          <button
            type="button"
            className="ml-4 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            onClick={() => {
              setEditId(null)
              setName("")
              setRole("")
              setPhoto("")
            }}
          >
            İptal
          </button>
        )}
      </form>
      <div className="space-y-4">
        {team.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {member.photo && <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover" />}
              <div>
                <div className="font-semibold text-[#FF6B6B]">{member.name}</div>
                <div className="text-gray-700">{member.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => handleEdit(member)}
              >
                Düzenle
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => handleDelete(member.id)}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 