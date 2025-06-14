import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const team = await prisma.team.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(team)
}

export async function POST(request: Request) {
  const data = await request.json()
  const member = await prisma.team.create({ data })
  return NextResponse.json({ success: true, member })
}

export async function PUT(request: Request) {
  const data = await request.json()
  const { id, name, role, photo } = data
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  const updated = await prisma.team.update({ where: { id }, data: { name, role, photo } })
  return NextResponse.json({ success: true, member: updated })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  await prisma.team.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 