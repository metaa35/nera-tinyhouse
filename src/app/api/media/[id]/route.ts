import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      )
    }

    const media = await prisma.media.findUnique({
      where: { id: idNum }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Medya dosyası bulunamadı' },
        { status: 404 }
      )
    }

    // Eğer Cloudinary URL'si ise Cloudinary'den de sil
    if (media.url.includes('cloudinary.com')) {
      try {
        // URL'den public_id'yi çıkar
        const urlParts = media.url.split('/')
        const filename = urlParts[urlParts.length - 1].split('.')[0]
        const folder = media.type === 'VIDEO' ? 'gallery/videos' : 'gallery/images'
        const publicId = `${folder}/${filename}`
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: media.type === 'VIDEO' ? 'video' : 'image'
        })
      } catch (cloudinaryError) {
        console.error('Cloudinary silme hatası:', cloudinaryError)
        // Cloudinary silme hatası olsa bile veritabanından silmeye devam et
      }
    }

    await prisma.media.delete({
      where: { id: idNum }
    })

    return NextResponse.json({ message: 'Medya dosyası başarıyla silindi' })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json(
      { error: 'Medya dosyası silinirken hata oluştu' },
      { status: 500 }
    )
  }
} 