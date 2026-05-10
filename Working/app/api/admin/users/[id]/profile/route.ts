import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
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
      updatedAt: true,
      lastLoginAt: true,
      campaigns: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          targetAmount: true,
          raisedAmount: true,
          donorCount: true,
          createdAt: true,
        },
      },
      donations: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          amount: true,
          isAnonymous: true,
          status: true,
          createdAt: true,
          campaign: { select: { id: true, title: true } },
        },
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          action: true,
          description: true,
          performedBy: true,
          createdAt: true,
        },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true,
          campaign: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
