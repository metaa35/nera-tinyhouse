import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

  // Dosyayı buffer'a çevir
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Cloudinary'ye yükle
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'projects' }, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }).end(buffer)
    })
    return NextResponse.json({ url: (uploadResult as any).secure_url })
  } catch (e) {
    return NextResponse.json({ error: 'Yükleme hatası', detail: e }, { status: 500 })
  }
} 