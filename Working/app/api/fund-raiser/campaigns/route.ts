import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'fund_raiser') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const campaigns = await prisma.campaign.findMany({
    where: { organiserId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { donations: true } },
    },
  })

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary,
      category: c.category,
      serviceType: c.serviceType,
      status: c.status,
      targetAmount: c.targetAmount,
      raisedAmount: c.raisedAmount,
      donorCount: c.donorCount,
      views: c.views,
      favouriteCount: c.favouriteCount,
      startDate: c.startDate,
      endDate: c.endDate,
      coverImage: c.coverImage,
      createdAt: c.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'fund_raiser') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title, summary, description, category, serviceType,
    targetAmount, startDate, endDate,
    beneficiaryName, beneficiaryRelationship,
    location, coverImage, isDraft,
  } = body

  const campaign = await prisma.campaign.create({
    data: {
      title,
      summary,
      description,
      category,
      serviceType,
      targetAmount: parseFloat(targetAmount),
      startDate,
      endDate,
      beneficiaryName,
      beneficiaryRelationship: beneficiaryRelationship || null,
      location: location || null,
      coverImage: coverImage || '',
      status: isDraft ? 'draft' : 'active',
      organiserId: session.id,
    },
  })

  return NextResponse.json({ success: true, campaignId: campaign.id })
}
