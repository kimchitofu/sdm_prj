import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'campaign_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const campaigns = await prisma.campaign.findMany({
    where: { status: 'active' },
    include: {
      organiser: { select: { firstName: true, lastName: true, email: true } },
      donations: {
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { amount: true, createdAt: true },
      },
    },
    orderBy: { raisedAmount: 'desc' },
  })

  const todayDonations = await prisma.donation.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: today } },
  })

  const platformTotals = await prisma.campaign.aggregate({
    _sum: { raisedAmount: true, donorCount: true },
    where: { status: 'active' },
  })

  const mappedCampaigns = campaigns.map((c) => {
    const recentTotal = c.donations.reduce((sum, d) => sum + d.amount, 0)
    const velocityPerDay = recentTotal / 7

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      status: c.status,
      targetAmount: c.targetAmount,
      raisedAmount: c.raisedAmount,
      donorCount: c.donorCount,
      views: c.views,
      coverImage: c.coverImage,
      startDate: c.startDate,
      endDate: c.endDate,
      organiserName: `${c.organiser.firstName} ${c.organiser.lastName}`,
      organiserEmail: c.organiser.email,
      velocityPerDay: Math.round(velocityPerDay * 100) / 100,
      recentDonationsCount: c.donations.length,
    }
  })

  return NextResponse.json({
    stats: {
      totalRaised: platformTotals._sum.raisedAmount ?? 0,
      activeCampaigns: campaigns.length,
      totalDonors: platformTotals._sum.donorCount ?? 0,
      todayVelocity: todayDonations._sum.amount ?? 0,
    },
    campaigns: mappedCampaigns,
  })
}
