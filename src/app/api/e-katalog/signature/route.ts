import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { timestamp, folder } = await request.json()

    // Cloudinary signature için gerekli parametreler
    const params = {
      timestamp,
      folder: folder || 'katalog',
      resource_type: 'raw',
      allowed_formats: 'pdf',
      overwrite: 'true',
      public_id: 'katalog'
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: params.folder
    })

  } catch (error) {
    console.error('Signature oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Signature oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
} 