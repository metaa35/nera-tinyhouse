import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json(
      { error: 'Medya dosyaları yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, alt, type } = body

    if (!title || !url || !type) {
      return NextResponse.json(
        { error: 'Başlık, URL ve tür alanları zorunludur' },
        { status: 400 }
      )
    }

    const media = await prisma.media.create({
      data: {
        title,
        url,
        alt,
        type: type as 'IMAGE' | 'VIDEO'
      }
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Media create error:', error)
    return NextResponse.json(
      { error: 'Medya dosyası oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
} 