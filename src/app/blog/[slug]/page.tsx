"use client"
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [blog, setBlog] = useState<any | null>(null)
  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then((blogs) => {
        const found = blogs.find((b: any) => b.slug === slug)
        setBlog(found || null)
      })
  }, [slug])

  if (!blog) return <div className="min-h-screen flex items-center justify-center">Blog bulunamadı veya yükleniyor...</div>

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="prose prose-lg mb-8" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />
        {blog.images && blog.images.length > 0 && (
          <div className="flex flex-col gap-8 mt-16">
            {blog.images.map((img: string, i: number) => (
              <div key={i} className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image src={img} alt={blog.title + ' görsel'} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 