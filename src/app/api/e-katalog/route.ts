import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

// Body parser konfigürasyonu
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json(
        { error: 'PDF dosyası bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya tipini kontrol et
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Sadece PDF dosyaları kabul edilir' },
        { status: 400 }
      )
    }

    // Dosya boyutunu kontrol et (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 50MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    // Eski dosyayı sil (varsa)
    try {
      const oldFilePath = join(process.cwd(), 'public', 'katalog.pdf')
      await unlink(oldFilePath)
    } catch (error) {
      // Dosya yoksa hata verme
    }

    // Yeni dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(process.cwd(), 'public', 'katalog.pdf')

    await writeFile(filePath, buffer)

    return NextResponse.json(
      { 
        message: 'PDF başarıyla yüklendi',
        url: '/katalog.pdf'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('PDF upload hatası:', error)
    return NextResponse.json(
      { error: 'PDF yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const fs = await import('fs/promises')
    const path = join(process.cwd(), 'public', 'katalog.pdf')

    try {
      await fs.access(path)
      return NextResponse.json({ 
        exists: true,
        url: '/katalog.pdf'
      })
    } catch {
      return NextResponse.json({ 
        exists: false,
        url: null
      })
    }

  } catch (error) {
    console.error('PDF kontrol hatası:', error)
    return NextResponse.json({
      exists: false,
      url: null
    })
  }
} 