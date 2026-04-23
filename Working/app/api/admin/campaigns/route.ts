import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      serviceType: true,
      targetAmount: true,
      status: true,
      coverImage: true,
      createdAt: true,
      organiser: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      campaignId: c.id,
      campaignTitle: c.title,
      campaignCategory: c.category,
      campaignServiceType: c.serviceType,
      targetAmount: c.targetAmount,
      status: c.status,
      coverImage: c.coverImage,
      submittedAt: c.createdAt.toISOString(),
      organiserName: `${c.organiser.firstName} ${c.organiser.lastName}`,
      organiserEmail: c.organiser.email,
      isOrganiserVerified: c.organiser.isVerified,
      flaggedIssues: [] as string[],
    })),
  })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { campaignId, status } = await req.json()
  if (!campaignId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  })

  return NextResponse.json({ campaign })
}
