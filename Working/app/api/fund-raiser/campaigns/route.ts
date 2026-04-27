import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format&fit=crop'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'fund_raiser') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.campaign.findMany({
      where: { organiserId: session.id },
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        serviceType: true,
        status: true,
        targetAmount: true,
        raisedAmount: true,
        donorCount: true,
        views: true,
        favouriteCount: true,
        endDate: true,
        coverImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      user: {
        id: session.id,
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
      },
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        summary: campaign.summary,
        category: campaign.category,
        serviceType: campaign.serviceType,
        status: campaign.status,
        targetAmount: Number(campaign.targetAmount ?? 0),
        raisedAmount: Number(campaign.raisedAmount ?? 0),
        donorCount: Number(campaign.donorCount ?? 0),
        views: Number(campaign.views ?? 0),
        favouriteCount: Number(campaign.favouriteCount ?? 0),
        endDate: campaign.endDate instanceof Date ? campaign.endDate.toISOString() : String(campaign.endDate),
        coverImage: campaign.coverImage || FALLBACK_IMAGE,
        createdAt: campaign.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to load fund raiser campaigns:', error)
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'fund_raiser') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await request.json()
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organiserId: session.id,
      },
      select: { id: true },
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.donation.deleteMany({ where: { campaignId } }),
      prisma.favourite.deleteMany({ where: { campaignId } }),
      prisma.campaignUpdate.deleteMany({ where: { campaignId } }),
      prisma.campaignReport.deleteMany({ where: { campaignId } }),
      prisma.auditLog.deleteMany({ where: { targetId: campaignId } }),
      prisma.campaign.delete({ where: { id: campaignId } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete fund raiser campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
