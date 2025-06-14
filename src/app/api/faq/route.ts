import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const faqs = await prisma.faq.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(faqs);
}

export async function POST(request: Request) {
  const data = await request.json();
  const faq = await prisma.faq.create({ data });
  return NextResponse.json({ success: true, faq });
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, question, answer } = data;
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 });
  const updated = await prisma.faq.update({ where: { id }, data: { question, answer } });
  return NextResponse.json({ success: true, faq: updated });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 });
  await prisma.faq.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 