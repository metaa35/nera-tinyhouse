import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Body parser konfigürasyonu
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const fileName = formData.get('fileName') as string

    if (!chunk) {
      return NextResponse.json(
        { error: 'Chunk bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya tipini kontrol et
    if (chunk.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Sadece PDF dosyaları kabul edilir' },
        { status: 400 }
      )
    }

    // Chunk'ı buffer'a çevir
    const bytes = await chunk.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary'ye chunk'ı yükle
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'katalog/chunks',
          resource_type: 'raw',
          format: 'pdf',
          public_id: `chunk_${chunkIndex}_${fileName}`,
          allowed_formats: ['pdf']
        },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = uploadResult as any

    // Son chunk ise, tüm chunk'ları birleştir
    if (chunkIndex === totalChunks - 1) {
      // Burada chunk'ları birleştirme işlemi yapılabilir
      // Şimdilik sadece son chunk'ı katalog olarak kaydet
      const finalResult = await cloudinary.uploader.rename(
        result.public_id,
        'katalog/katalog',
        { overwrite: true }
      )

      return NextResponse.json(
        { 
          message: 'PDF başarıyla yüklendi',
          url: finalResult.secure_url,
          public_id: finalResult.public_id
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        message: `Chunk ${chunkIndex + 1}/${totalChunks} yüklendi`,
        chunkIndex,
        totalChunks
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Chunk upload hatası:', error)
    return NextResponse.json(
      { error: 'Chunk yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 