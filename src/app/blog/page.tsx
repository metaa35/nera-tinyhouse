"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => setBlogs(Array.isArray(data) ? data : []))
  }, [])

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.filter(Boolean).map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              {blog.coverImage && (
                <div className="relative h-56">
                  <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.content?.slice(0, 120)}...</p>
                <span className="text-blue-600 hover:underline">Devamını Oku</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
} 