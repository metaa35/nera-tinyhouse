interface Media {
  id: number
  title: string
  url: string
  alt?: string
  type: 'IMAGE' | 'VIDEO'
  createdAt: string
}

// Galeri medya dosyalarını cache'lemek için
let mediaCache: Media[] = []
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

export async function fetchGalleryMedia(): Promise<Media[]> {
  const now = Date.now()
  
  // Cache süresi dolmamışsa cache'den döndür
  if (mediaCache.length > 0 && now - lastFetch < CACHE_DURATION) {
    return mediaCache
  }

  try {
    const response = await fetch('/api/media')
    if (response.ok) {
      const data = await response.json()
      mediaCache = data
      lastFetch = now
      return data
    }
  } catch (error) {
    console.error('Galeri medya dosyaları yüklenirken hata:', error)
  }

  return []
}

export function getRandomImages(count: number = 1): Media[] {
  const images = mediaCache.filter(item => item.type === 'IMAGE')
  
  if (images.length === 0) return []
  
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, images.length))
}

export function getRandomVideos(count: number = 1): Media[] {
  const videos = mediaCache.filter(item => item.type === 'VIDEO')
  
  if (videos.length === 0) return []
  
  const shuffled = [...videos].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, videos.length))
}

export function getRandomMedia(count: number = 1): Media[] {
  if (mediaCache.length === 0) return []
  
  const shuffled = [...mediaCache].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, mediaCache.length))
}

// Cache'i temizle (yeni medya eklendiğinde kullanılır)
export function clearMediaCache() {
  mediaCache = []
  lastFetch = 0
} 