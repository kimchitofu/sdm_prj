import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [allDonations, activeCampaigns, recentDonations] = await Promise.all([
    prisma.donation.findMany({
      where: { status: 'completed' },
      select: { amount: true, createdAt: true },
    }),
    prisma.campaign.count({ where: { status: 'active' } }),
    prisma.donation.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        donorName: true,
        isAnonymous: true,
        amount: true,
        status: true,
        createdAt: true,
        campaign: { select: { title: true, category: true } },
      },
    }),
  ])

  const totalRaised = allDonations.reduce((sum, d) => sum + d.amount, 0)
  const totalDonations = allDonations.length
  const avgDonation = totalDonations > 0 ? totalRaised / totalDonations : 0

  // Build daily stats for the last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const dailyMap: Record<string, { amount: number; count: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    dailyMap[key] = { amount: 0, count: 0 }
  }

  for (const d of allDonations) {
    const key = d.createdAt.toISOString().split('T')[0]
    if (dailyMap[key]) {
      dailyMap[key].amount += d.amount
      dailyMap[key].count += 1
    }
  }

  const dailyStats = Object.entries(dailyMap).map(([date, v]) => ({
    date,
    amount: v.amount,
    count: v.count,
  }))

  // Category breakdown from all completed donations
  const categoryMap: Record<string, number> = {}
  const [campaignDonations] = await Promise.all([
    prisma.donation.findMany({
      where: { status: 'completed' },
      select: { amount: true, campaign: { select: { category: true } } },
    }),
  ])
  for (const d of campaignDonations) {
    const cat = d.campaign.category
    categoryMap[cat] = (categoryMap[cat] ?? 0) + d.amount
  }
  const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  return NextResponse.json({
    stats: {
      totalRaised,
      totalDonations,
      avgDonation,
      activeCampaigns,
    },
    dailyStats,
    categoryBreakdown,
    recentDonations: recentDonations.map((d) => ({
      id: d.id,
      donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
      isAnonymous: d.isAnonymous,
      amount: d.amount,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      campaignTitle: d.campaign.title,
      category: d.campaign.category,
    })),
  })
}
