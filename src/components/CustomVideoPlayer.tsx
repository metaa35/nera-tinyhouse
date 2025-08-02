'use client'

import { useState, useRef, useEffect } from 'react'

interface CustomVideoPlayerProps {
  url: string
  title?: string
  className?: string
  thumbnail?: string
}

export default function CustomVideoPlayer({ url, title, className = '', thumbnail }: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const youtubePlayerRef = useRef<any>(null)

  // YouTube URL'sini embed formatına çevir
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed')) return url
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    return url
  }

  // YouTube URL'si mi kontrol et
  const isYouTube = url.includes('youtube.com/embed') || url.includes('youtu.be') || url.includes('youtube.com/watch')

  // YouTube video ID'sini al
  const getVideoId = (url: string) => {
    if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1]
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]
    }
    if (url.includes('youtube.com/watch')) {
      return url.split('v=')[1]?.split('&')[0]
    }
    return null
  }

  const videoId = getVideoId(url)
  const defaultThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : thumbnail

  // YouTube API yükle
  useEffect(() => {
    if (isYouTube && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
  }, [isYouTube])

  // YouTube Player oluştur
  useEffect(() => {
    if (isYouTube && isPlaying && videoId && window.YT && playerRef.current) {
      window.YT.ready(() => {
        youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            fs: 0,
            disablekb: 1,
            playsinline: 1,
            title: 0,
            byline: 0,
            portrait: 0,
            color: 'white',
            theme: 'dark',
            wmode: 'transparent'
          },
          events: {
            onReady: (event: any) => {
              setIsLoading(false)
              setDuration(event.target.getDuration())
              
              // YouTube başlığını gizle
              const iframe = event.target.getIframe()
              if (iframe) {
                iframe.style.pointerEvents = 'none'
                // CSS ile başlığı gizle
                const style = document.createElement('style')
                style.textContent = `
                  .ytp-title, .ytp-show-cards-title, .ytp-watermark, 
                  .ytp-youtube-button, .ytp-branding-button, .ytp-pause-overlay,
                  .ytp-cued-thumbnail-overlay, .ytp-title-text {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                  }
                `
                iframe.contentDocument?.head?.appendChild(style)
              }
              
              // Progress güncelleme
              setInterval(() => {
                if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
                  setCurrentTime(youtubePlayerRef.current.getCurrentTime())
                }
              }, 1000)
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
              }
            }
          }
        })
      })
    }
  }, [isYouTube, isPlaying, videoId])

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(true)
  }

  const handlePlayPause = () => {
    if (youtubePlayerRef.current) {
      if (youtubePlayerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
        youtubePlayerRef.current.pauseVideo()
      } else {
        youtubePlayerRef.current.playVideo()
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true)
    }
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100)
    }
  }

  const handleMute = () => {
    if (youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute()
        setIsMuted(false)
      } else {
        youtubePlayerRef.current.mute()
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isYouTube && !isPlaying) {
    return (
      <div className={`relative ${className} group cursor-pointer`} onClick={handlePlay}>
        {/* Thumbnail */}
        <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gray-900">
          <img
            src={defaultThumbnail}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
          <div className="w-16 h-16 bg-white bg-opacity-95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Video Title */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-medium text-sm">{title}</h3>
          </div>
        )}
      </div>
    )
  }

  if (isYouTube && isPlaying) {
    return (
      <div 
        className={`relative ${className} bg-black rounded-lg overflow-hidden shadow-lg`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* YouTube Player Container */}
        <div ref={playerRef} className="w-full h-full min-h-[400px] youtube-player-container" />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Simple Controls - Görseldeki gibi */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button onClick={handlePlayPause} className="hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                
                <button onClick={handleMute} className="hover:opacity-80 transition-opacity">
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Normal video dosyası
  return (
    <div className={`relative ${className} bg-black rounded-lg overflow-hidden shadow-lg`}>
      <video
        controls
        className="w-full h-full min-h-[400px]"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={url} type="video/mp4" />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}

// YouTube API için global tip tanımı
declare global {
  interface Window {
    YT: any
  }
} 