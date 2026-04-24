import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ['active', 'approved'] } },
    include: {
      organiser: {
        select: { id: true, firstName: true, lastName: true, avatar: true, isVerified: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary,
      description: c.description,
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
      coverImage: c.coverImage ?? '',
      gallery: [],
      updates: [],
      tags: [],
      createdAt: c.createdAt.toISOString(),
      location: c.organiser.firstName,
      organiser: {
        id: c.organiser.id,
        name: `${c.organiser.firstName} ${c.organiser.lastName}`,
        avatar: c.organiser.avatar ?? undefined,
        isVerified: c.organiser.isVerified,
        totalCampaigns: 0,
        totalRaised: 0,
      },
      beneficiary: {
        name: c.beneficiaryName ?? '',
        relationship: c.beneficiaryRelationship ?? undefined,
        description: c.beneficiaryDescription ?? undefined,
      },
    })),
  })
}
