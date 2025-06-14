import { NextRequest, NextResponse } from 'next/server'

// Mock ana sayfa verisi (bellekte tutulur)
let homeData = {
  heroTitle: 'Hayalinizdeki Tiny House',
  heroDescription: 'Modern ve sürdürülebilir tiny house çözümleri ile hayalinizdeki yaşam alanını birlikte tasarlayalım.',
  heroButton: 'Ücretsiz Keşif',
  heroImage: '/default-hero.jpg',
  sliderImages: ['/slider1.jpg', '/slider2.jpg'],
  galleryImages: ['/gallery1.jpg', '/gallery2.jpg', '/gallery3.jpg'],
};

export async function GET() {
  return NextResponse.json(homeData);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  homeData = { ...homeData, ...data };
  return NextResponse.json({ success: true, homeData });
} 