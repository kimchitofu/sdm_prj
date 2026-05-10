import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendAccountFreezeEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action, reason } = await request.json()

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

  if (action === 'freeze' && (!reason || !reason.trim())) {
    return NextResponse.json({ error: 'A reason is required to freeze an account' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const userUpdateData: Record<string, string | null> = { status: newStatus }
  if (action === 'freeze') {
    userUpdateData.statusReason = reason.trim()
  } else {
    userUpdateData.statusReason = null
  }

  const logDescription = action === 'freeze'
    ? `Account frozen by admin. Reason: ${reason.trim()}`
    : `Account status changed to "${newStatus}" by admin.`

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: userUpdateData,
    }),
    prisma.auditLog.create({
      data: {
        userId: id,
        targetId: id,
        targetType: 'user',
        action: logAction,
        description: logDescription,
        performedBy: session.email,
      },
    }),
  ])

  // Send freeze email — non-blocking, don't fail the request if email fails
  if (action === 'freeze') {
    sendAccountFreezeEmail({
      to: target.email,
      firstName: target.firstName,
      reason: reason.trim(),
    }).catch((err) => console.error('Failed to send freeze email:', err))
  }

  return NextResponse.json({ success: true, status: newStatus })
}
