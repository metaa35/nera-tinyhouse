import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Video başlığı gerekli' }, { status: 400 })
    }

    // YouTube API token'ını al
    const tokenResponse = await fetch('/api/youtube/token')
    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'YouTube yetkilendirmesi gerekli' }, { status: 401 })
    }
    
    const { access_token } = await tokenResponse.json()
    oauth2Client.setCredentials({ access_token })

    const youtube = google.youtube('v3')

    // Video metadata'sını hazırla
    const videoMetadata = {
      snippet: {
        title,
        description,
        tags: ['nera', 'gallery'],
        categoryId: '22', // People & Blogs
        defaultLanguage: 'tr',
        defaultAudioLanguage: 'tr'
      },
      status: {
        privacyStatus: 'unlisted', // Sadece link ile erişilebilir
        embeddable: true,
        publicStatsViewable: false
      }
    }

    // Video dosyasını buffer'a çevir
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // YouTube'a upload
    const uploadResponse = await youtube.videos.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: buffer
      }
    })

    const videoId = uploadResponse.data.id
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const embedUrl = `https://www.youtube.com/embed/${videoId}`

    return NextResponse.json({
      success: true,
      videoId,
      videoUrl,
      embedUrl,
      title: uploadResponse.data.snippet?.title,
      thumbnail: uploadResponse.data.snippet?.thumbnails?.default?.url
    })

  } catch (error) {
    console.error('YouTube upload hatası:', error)
    return NextResponse.json(
      { error: 'Video yüklenirken hata oluştu' }, 
      { status: 500 }
    )
  }
} 