import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const announcements = await prisma.announcement.findMany({
    where: {
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, message: true, type: true, createdAt: true },
  })
  return NextResponse.json({ announcements })
}
