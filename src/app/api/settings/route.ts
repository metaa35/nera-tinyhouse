import { NextRequest, NextResponse } from 'next/server'

// Mock ayar verisi (bellekte tutulur)
let settings = {
  siteName: 'Nera',
  siteDescription: 'Modern web sitesi',
  contactEmail: 'info@nera.com',
  maintenanceMode: false,
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  settings = { ...settings, ...data };
  return NextResponse.json({ success: true, settings });
} 