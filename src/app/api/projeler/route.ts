import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: { images: true }
    })
    if (!project) return NextResponse.json(null, { status: 404 })
    return NextResponse.json({
      ...project,
      images: project.images.map(img => img.url),
      coverImage: project.images[0]?.url || '',
    })
  } else {
    const projects = await prisma.project.findMany({
      include: { images: true },
      orderBy: { id: 'desc' }
    })
    // images alanını diziye çevir
    const result = projects.map(p => ({
      ...p,
      images: p.images.map(img => img.url),
      coverImage: p.images[0]?.url || '',
    }))
    return NextResponse.json(result)
  }
}

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

export async function PUT(request: Request) {
  const data = await request.json()
  const { id, title, slug, description, content, images = [] } = data
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  // Proje güncelle
  const updated = await prisma.project.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      content: content || '',
    }
  })
  // Eski görselleri sil, yenilerini ekle
  await prisma.image.deleteMany({ where: { projectId: id } })
  await prisma.image.createMany({ data: images.map((url: string) => ({ url, projectId: id })) })
  const project = await prisma.project.findUnique({ where: { id }, include: { images: true } })
  return NextResponse.json({ success: true, project: {
    ...project,
    images: project?.images.map(img => img.url) || [],
    coverImage: project?.images[0]?.url || '',
  } })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  await prisma.image.deleteMany({ where: { projectId: id } })
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 