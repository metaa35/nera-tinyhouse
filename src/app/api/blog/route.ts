import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'src', 'data', 'blogs.json')

export async function GET() {
  try {
    const file = await fs.readFile(dataFile, 'utf-8')
    const blogs = JSON.parse(file)
    return NextResponse.json(blogs)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const data = await request.json()
  let blogs = []
  try {
    const file = await fs.readFile(dataFile, 'utf-8')
    blogs = JSON.parse(file)
  } catch (e) {}
  const newBlog = {
    id: Date.now(),
    title: data.title,
    slug: data.slug,
    content: data.content,
    images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
    coverImage: data.coverImage || (Array.isArray(data.images) ? data.images[0] : ''),
    features: typeof data.features === 'string' ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean) : (data.features || []),
    createdAt: new Date().toISOString()
  }
  blogs.push(newBlog)
  await fs.writeFile(dataFile, JSON.stringify(blogs.filter(Boolean), null, 2))
  return NextResponse.json({ success: true, blog: newBlog })
}

export async function PUT(request: Request) {
  const data = await request.json()
  let blogs = []
  try {
    const file = await fs.readFile(dataFile, 'utf-8')
    blogs = JSON.parse(file)
  } catch (e) {}
  const { slug } = data
  if (!slug) return NextResponse.json({ error: 'slug zorunlu' }, { status: 400 })
  let updated = false
  blogs = blogs.map((b: any) => {
    if (b.slug === slug) {
      updated = true
      return {
        ...b,
        ...data,
        images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
        coverImage: data.coverImage || (Array.isArray(data.images) ? data.images[0] : ''),
        features: typeof data.features === 'string' ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean) : (data.features || [])
      }
    }
    return b
  })
  if (!updated) return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
  await fs.writeFile(dataFile, JSON.stringify(blogs.filter(Boolean), null, 2))
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { slug } = await request.json()
  if (!slug) return NextResponse.json({ error: 'slug zorunlu' }, { status: 400 })
  let blogs = []
  try {
    const file = await fs.readFile(dataFile, 'utf-8')
    blogs = JSON.parse(file)
  } catch (e) {}
  const newBlogs = blogs.filter((b: any) => b.slug !== slug)
  await fs.writeFile(dataFile, JSON.stringify(newBlogs.filter(Boolean), null, 2))
  return NextResponse.json({ success: true })
} 