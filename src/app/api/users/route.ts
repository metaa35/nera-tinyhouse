import { NextRequest, NextResponse } from 'next/server'

// Mock kullanıcı verisi (geçici olarak bellekte tutulur)
let users = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Editor User', email: 'editor@example.com', role: 'editor' },
  { id: '3', name: 'Viewer User', email: 'viewer@example.com', role: 'viewer' },
]

export async function GET() {
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const newUser = { ...data, id: Date.now().toString() }
  users.push(newUser)
  return NextResponse.json(newUser, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  users = users.map(u => u.id === data.id ? { ...u, ...data } : u)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  users = users.filter(u => u.id !== id)
  return NextResponse.json({ success: true })
} 