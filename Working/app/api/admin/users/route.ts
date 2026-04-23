import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [users, flaggedLogs] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        avatar: true,
        bio: true,
        isVerified: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.findMany({
      where: { action: { in: ['account_frozen', 'account_suspended'] } },
      select: { userId: true },
    }),
  ])

  const flaggedUserIds = [...new Set(flaggedLogs.map((l) => l.userId))]

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      displayName: `${u.firstName} ${u.lastName}`,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    })),
    flaggedUserIds,
  })
}
