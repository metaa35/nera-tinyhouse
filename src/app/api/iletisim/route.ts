import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET: Tüm mesajları getir
export async function GET() {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 })
  }
}

// POST: Yeni mesaj ekle
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newMessage = await prisma.contact.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
      }
    })
    return NextResponse.json(newMessage)
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj eklenemedi' }, { status: 500 })
  }
}

// DELETE: Mesaj sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID parametresi gerekli' }, { status: 400 })
    }
    await prisma.contact.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj silinemedi' }, { status: 500 })
  }
}

// PUT: Mesajı okundu olarak işaretle
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID parametresi gerekli' }, { status: 400 })
    }
    const updated = await prisma.contact.update({
      where: { id: Number(id) },
      data: { isRead: true }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj güncellenemedi' }, { status: 500 })
  }
} 