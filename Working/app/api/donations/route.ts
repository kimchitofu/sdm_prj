import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { campaignId, amount, isAnonymous, message } = await request.json()

  if (!campaignId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid donation data' }, { status: 400 })
  }

  const session = await getSession()

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const donorName = isAnonymous
    ? 'Anonymous'
    : session
    ? `${session.firstName} ${session.lastName}`
    : 'Anonymous'

  const donation = await prisma.donation.create({
    data: {
      campaignId,
      donorId: session?.id ?? null,
      donorName,
      donorEmail: session?.email ?? null,
      amount,
      isAnonymous: isAnonymous ?? false,
      message: message || null,
      status: 'completed',
    },
  })

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      raisedAmount: { increment: amount },
      donorCount: { increment: 1 },
    },
  })

  return NextResponse.json({
    success: true,
    donationId: donation.id,
    confirmationNumber: `DON-${donation.id.slice(-8).toUpperCase()}`,
  })
}
