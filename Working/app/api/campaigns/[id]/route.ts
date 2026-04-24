import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const c = await prisma.campaign.findUnique({
    where: { id },
    include: {
      organiser: {
        select: { id: true, firstName: true, lastName: true, avatar: true, isVerified: true },
      },
      updates: { orderBy: { createdAt: 'desc' } },
      donations: {
        where: { status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          donorName: true,
          isAnonymous: true,
          amount: true,
          message: true,
          createdAt: true,
        },
      },
    },
  })

  if (!c) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    campaign: {
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
      tags: [],
      createdAt: c.createdAt.toISOString(),
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
      updates: c.updates.map((u) => ({
        id: u.id,
        campaignId: u.campaignId,
        title: u.title,
        content: u.content,
        createdAt: u.createdAt.toISOString(),
      })),
      recentDonations: c.donations.map((d) => ({
        id: d.id,
        donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
        isAnonymous: d.isAnonymous,
        amount: d.amount,
        message: d.message ?? undefined,
        createdAt: d.createdAt.toISOString(),
      })),
    },
  })
}
