import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reports = await prisma.campaignReport.findMany({
    include: {
      campaign: { select: { title: true } },
      reportedBy: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      resolvedBy: r.resolvedBy,
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      resolution: r.resolution,
      createdAt: r.createdAt.toISOString(),
      campaignId: r.campaignId,
      campaignTitle: r.campaign.title,
      reportedById: r.reportedById,
      reporterName: `${r.reportedBy.firstName} ${r.reportedBy.lastName}`,
      reporterEmail: r.reportedBy.email,
    })),
  })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId, status, resolution } = await req.json()
  if (!reportId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const report = await prisma.campaignReport.update({
    where: { id: reportId },
    data: {
      status,
      resolution: resolution ?? null,
      resolvedBy: session.firstName + ' ' + session.lastName,
      resolvedAt: new Date(),
    },
  })

  return NextResponse.json({ report })
}
