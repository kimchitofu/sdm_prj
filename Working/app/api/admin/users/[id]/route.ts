import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await request.json()

  const actionStatusMap: Record<string, string> = {
    freeze: 'frozen',
    unfreeze: 'active',
    suspend: 'suspended',
    activate: 'active',
    deactivate: 'deactivated',
  }

  const actionLogMap: Record<string, string> = {
    freeze: 'account_frozen',
    unfreeze: 'account_unfrozen',
    suspend: 'account_suspended',
    activate: 'account_activated',
    deactivate: 'account_deactivated',
  }

  const newStatus = actionStatusMap[action]
  const logAction = actionLogMap[action]

  if (!newStatus || !logAction) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { status: newStatus },
    }),
    prisma.auditLog.create({
      data: {
        userId: id,
        targetId: id,
        targetType: 'user',
        action: logAction,
        description: `Account status changed to "${newStatus}" by admin.`,
        performedBy: session.email,
      },
    }),
  ])

  return NextResponse.json({ success: true, status: newStatus })
}
