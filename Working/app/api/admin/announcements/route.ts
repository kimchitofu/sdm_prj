import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ announcements })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, message, type, expiresAt } = await req.json()
  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      message,
      type: type ?? 'info',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: session.id,
    },
  })

  return NextResponse.json({ announcement }, { status: 201 })
}
