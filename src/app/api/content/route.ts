import { NextRequest, NextResponse } from 'next/server'

// Mock içerik verisi (geçici olarak bellekte tutulur)
let contents = [
  { id: '1', title: 'Ana Sayfa', type: 'Sayfa', status: 'Yayında', lastModified: '2024-03-20' },
  { id: '2', title: 'Hakkımızda', type: 'Sayfa', status: 'Taslak', lastModified: '2024-03-19' },
  { id: '3', title: 'Blog Yazısı 1', type: 'Blog', status: 'Yayında', lastModified: '2024-03-18' },
]

export async function GET() {
  return NextResponse.json(contents)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const newContent = { ...data, id: Date.now().toString(), lastModified: new Date().toISOString().slice(0, 10) }
  contents.push(newContent)
  return NextResponse.json(newContent, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  contents = contents.map(c => c.id === data.id ? { ...c, ...data, lastModified: new Date().toISOString().slice(0, 10) } : c)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  contents = contents.filter(c => c.id !== id)
  return NextResponse.json({ success: true })
} 