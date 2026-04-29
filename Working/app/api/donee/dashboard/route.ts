import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [donations, favourites, thisMonthDonations, activeCampaigns] = await Promise.all([
    prisma.donation.findMany({
      where: { donorId: session.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        campaign: { select: { id: true, title: true } },
      },
    }),
    prisma.favourite.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        campaign: { select: { id: true, title: true } },
      },
    }),
    prisma.donation.aggregate({
      where: { donorId: session.id, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.campaign.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 4,
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
        coverImage: true,
        startDate: true,
        endDate: true,
        location: true,
        createdAt: true,
        organiser: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
  const campaignsSupported = new Set(donations.map(d => d.campaign.id)).size

  // Merge donations + favourites into recent activity, sorted by date
  const donationActivity = donations.slice(0, 10).map(d => ({
    type: 'donation' as const,
    campaignId: d.campaign.id,
    campaign: d.campaign.title,
    amount: d.amount,
    createdAt: d.createdAt.toISOString(),
  }))

  const favouriteActivity = favourites.slice(0, 10).map(f => ({
    type: 'favourite' as const,
    campaignId: f.campaign.id,
    campaign: f.campaign.title,
    amount: null,
    createdAt: f.createdAt.toISOString(),
  }))

  const recentActivity = [...donationActivity, ...favouriteActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return NextResponse.json({
    stats: {
      totalDonated: Math.round(totalDonated * 100) / 100,
      activeFavourites: favourites.length,
      campaignsSupported,
      thisMonth: Math.round((thisMonthDonations._sum.amount ?? 0) * 100) / 100,
    },
    recentActivity,
    recommendedCampaigns: activeCampaigns.map(c => ({
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
      coverImage: c.coverImage,
      startDate: c.startDate,
      endDate: c.endDate,
      location: c.location,
      createdAt: c.createdAt.toISOString(),
      organiser: { name: `${c.organiser.firstName} ${c.organiser.lastName}` },
    })),
  })
}
