import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = context.params
  const body = await req.json()

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.message !== undefined && { message: body.message }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.expiresAt !== undefined && {
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      }),
    },
  })

  return NextResponse.json({ announcement })
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = context.params

  await prisma.announcement.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}