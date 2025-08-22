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

// Kullanılan görselleri takip etmek için
let usedImageIds: Set<number> = new Set()

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

export function getUniqueRandomImages(count: number = 1): Media[] {
  const images = mediaCache.filter(item => item.type === 'IMAGE')
  
  if (images.length === 0) return []
  
  // Kullanılmamış görselleri filtrele
  const availableImages = images.filter(img => !usedImageIds.has(img.id))
  
  // Eğer yeterli benzersiz görsel yoksa, kullanılan görselleri sıfırla
  if (availableImages.length < count) {
    usedImageIds.clear()
    return getRandomImages(count)
  }
  
  // Benzersiz görselleri karıştır ve seç
  const shuffled = [...availableImages].sort(() => 0.5 - Math.random())
  const selectedImages = shuffled.slice(0, count)
  
  // Seçilen görselleri kullanıldı olarak işaretle
  selectedImages.forEach(img => usedImageIds.add(img.id))
  
  return selectedImages
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
  usedImageIds.clear()
}

// Kullanılan görselleri sıfırla
export function resetUsedImages() {
  usedImageIds.clear()
} 