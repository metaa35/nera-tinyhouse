import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Burada YouTube OAuth token'ınızı döndürün
    // Gerçek uygulamada bu token'ı güvenli bir şekilde saklamanız gerekir
    const access_token = process.env.YOUTUBE_ACCESS_TOKEN
    
    if (!access_token) {
      return NextResponse.json({ error: 'YouTube token bulunamadı' }, { status: 401 })
    }

    return NextResponse.json({ access_token })
  } catch (error) {
    console.error('Token hatası:', error)
    return NextResponse.json({ error: 'Token alınamadı' }, { status: 500 })
  }
} 