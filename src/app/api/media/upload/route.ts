import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image' veya 'video'
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    if (!type || !['image', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Geçersiz dosya türü' }, { status: 400 })
    }

    // Dosyayı buffer'a çevir
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Cloudinary'ye yükle
    const uploadResult = await new Promise((resolve, reject) => {
      const folder = type === 'video' ? 'gallery/videos' : 'gallery/images'
      
      cloudinary.uploader.upload_stream(
        { 
          folder,
          resource_type: type === 'video' ? 'video' : 'image',
          allowed_formats: type === 'video' 
            ? ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'] 
            : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: type === 'image' ? [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' }
          ] : undefined
        }, 
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = uploadResult as any
    
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type
    })

  } catch (error) {
    console.error('Galeri upload hatası:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' }, 
      { status: 500 }
    )
  }
} 