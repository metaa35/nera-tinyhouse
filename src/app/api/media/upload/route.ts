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

    // Dosya boyutu kontrolü (Vercel limiti: 4.5MB)
    const VERCEL_LIMIT = 4.5 * 1024 * 1024
    
    // Video dosyaları için her zaman direkt upload kullan
    if (type === 'video' || file.size > VERCEL_LIMIT) {
      // Büyük dosyalar için direkt Cloudinary upload URL'i döndür
      const folder = type === 'video' ? 'gallery/videos' : 'gallery/images'
      const timestamp = Math.round(new Date().getTime() / 1000)
      
      const params = {
        timestamp,
        folder,
        resource_type: type === 'video' ? 'video' : 'image',
        allowed_formats: type === 'video' 
          ? ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'] 
          : ['jpg', 'jpeg', 'png', 'gif', 'webp']
      }
      
      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET!
      )

      return NextResponse.json({
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${type === 'video' ? 'video' : 'image'}/upload`,
        uploadParams: {
          ...params,
          signature
        },
        isDirectUpload: true
      })
    }

    // Küçük dosyalar için normal upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

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
          ] : type === 'video' ? [
            { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
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
      resource_type: result.resource_type,
      isDirectUpload: false
    })

  } catch (error) {
    console.error('Galeri upload hatası:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' }, 
      { status: 500 }
    )
  }
} 