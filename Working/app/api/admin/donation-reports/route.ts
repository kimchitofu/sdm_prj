import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'campaign_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const where: Record<string, unknown> = {}
  if (start || end) {
    where.createdAt = {}
    if (start) (where.createdAt as Record<string, unknown>).gte = new Date(start + 'T00:00:00Z')
    if (end) (where.createdAt as Record<string, unknown>).lte = new Date(end + 'T23:59:59Z')
  }

  const donations = await prisma.donation.findMany({
    where,
    include: { campaign: { select: { title: true, category: true } } },
    orderBy: { createdAt: 'asc' },
  })

  // Group by date
  const byDate = new Map<string, { total: number; count: number; donations: typeof donations }>()
  for (const d of donations) {
    const dateKey = d.createdAt.toISOString().split('T')[0]
    if (!byDate.has(dateKey)) byDate.set(dateKey, { total: 0, count: 0, donations: [] })
    const entry = byDate.get(dateKey)!
    entry.total += d.amount
    entry.count += 1
    entry.donations.push(d)
  }

  const dailyTotals = Array.from(byDate.entries()).map(([date, v]) => ({
    date,
    total: Math.round(v.total * 100) / 100,
    count: v.count,
    avg: v.count > 0 ? Math.round((v.total / v.count) * 100) / 100 : 0,
  }))

  const totalAmount = donations.reduce((s, d) => s + d.amount, 0)
  const totalCount = donations.length
  const peakEntry = dailyTotals.reduce((best, d) => (d.total > (best?.total ?? 0) ? d : best), dailyTotals[0] ?? null)

  return NextResponse.json({
    dailyTotals,
    donations: donations.map((d) => ({
      id: d.id,
      amount: d.amount,
      donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
      isAnonymous: d.isAnonymous,
      campaignTitle: d.campaign.title,
      category: d.campaign.category,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    })),
    summary: {
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalCount,
      avgDonation: totalCount > 0 ? Math.round((totalAmount / totalCount) * 100) / 100 : 0,
      peakDate: peakEntry?.date ?? null,
      peakAmount: peakEntry?.total ?? 0,
    },
  })
}
