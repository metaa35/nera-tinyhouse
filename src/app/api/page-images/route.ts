import { NextRequest, NextResponse } from 'next/server'

// Mock veri: Her sayfa için görselleri tutan bir nesne
let pageImages: Record<string, string[]> = {
  anasayfa: ['/default-hero.jpg', '/slider1.jpg'],
  hakkimizda: ['/about1.jpg', '/about2.jpg'],
  projeler: ['/project1.jpg', '/project2.jpg'],
  iletisim: ['/contact1.jpg'],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'anasayfa';
  return NextResponse.json(pageImages[slug] || []);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'anasayfa';
  const data = await req.json();
  // data.images: string[]
  pageImages[slug] = data.images;
  return NextResponse.json({ success: true, images: pageImages[slug] });
} 