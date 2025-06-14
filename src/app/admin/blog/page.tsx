"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => setBlogs(Array.isArray(data) ? data : []))
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return
    await fetch('/api/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug })
    })
    setBlogs(prev => prev.filter(b => b.slug !== slug))
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Bloglar</h2>
          <p className="mt-1 text-sm text-gray-500">Tüm blog yazılarını buradan yönetebilirsiniz</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/blog/yeni" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Yeni Blog</Link>
        </div>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {blogs.filter(Boolean).map((blog) => (
            <li key={blog.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 truncate">{blog.title}</p>
                  <p className="text-xs text-gray-500">{blog.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/blog/${blog.slug}/duzenle`} className="font-medium text-blue-600 hover:text-blue-500">Düzenle</Link>
                  <button type="button" className="font-medium text-red-600 hover:text-red-500" onClick={() => handleDelete(blog.slug)}>Sil</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 