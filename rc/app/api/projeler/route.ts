import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Gelen veri:', data)
    const { title, slug, description, content, images = [], features = [] } = data
    
    if (!title || !slug || !description) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content: content || '',
        images: {
          create: images.map((url: string) => ({ url }))
        },
      },
      include: { images: true }
    })
    
    return NextResponse.json({ success: true, project: {
      ...project,
      images: project.images.map((img: { url: string }) => img.url),
      coverImage: project.images[0]?.url || '',
    }})
  } catch (error: any) {
    console.error('Proje oluşturma hatası:', error)
    return NextResponse.json({ error: 'Proje oluşturulamadı', details: error.message }, { status: 500 })
  }
} 