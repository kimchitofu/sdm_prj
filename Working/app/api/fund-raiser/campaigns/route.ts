import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalString(value: unknown) {
  const next = asTrimmedString(value)
  return next.length > 0 ? next : null
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
}

type CampaignDonationRow = {
  id: string
  donorName: string | null
  donorEmail: string | null
  amount: unknown
  isAnonymous: boolean
  createdAt: Date
}

function buildCampaignDonorRows(donations: CampaignDonationRow[]) {
  const donorsByKey = new Map<
    string,
    {
      id: string
      name: string
      email: string | null
      totalDonated: number
      donationCount: number
      lastDonationAt: Date
    }
  >()

  for (const donation of donations) {
    const isAnonymous = Boolean(donation.isAnonymous)
    const name = isAnonymous ? 'Anonymous donor' : donation.donorName?.trim() || donation.donorEmail?.trim() || 'Unknown donor'
    const email = isAnonymous ? null : donation.donorEmail?.trim() || null
    const key = isAnonymous ? `anonymous-${donation.id}` : email?.toLowerCase() || name.toLowerCase() || `guest-${donation.id}`
    const amount = Number(donation.amount || 0)
    const existing = donorsByKey.get(key)

    if (existing) {
      existing.totalDonated += Number.isFinite(amount) ? amount : 0
      existing.donationCount += 1
      if (donation.createdAt.getTime() > existing.lastDonationAt.getTime()) {
        existing.lastDonationAt = donation.createdAt
      }
      continue
    }

    donorsByKey.set(key, {
      id: key,
      name,
      email,
      totalDonated: Number.isFinite(amount) ? amount : 0,
      donationCount: 1,
      lastDonationAt: donation.createdAt,
    })
  }

  return Array.from(donorsByKey.values())
    .sort((a, b) => b.totalDonated - a.totalDonated)
    .map((donor) => ({
      ...donor,
      lastDonationAt: donor.lastDonationAt.toISOString(),
    }))
}

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
      donations: {
        where: { status: 'completed' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          amount: true,
          isAnonymous: true,
          createdAt: true,
        },
      },
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
      donors: buildCampaignDonorRows(c.donations),
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'fund_raiser') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const isDraft = Boolean(body?.isDraft)
    const title = asTrimmedString(body?.title)
    const summary = asTrimmedString(body?.summary)
    const description = asTrimmedString(body?.description)
    const category = asTrimmedString(body?.category)
    const serviceType = asTrimmedString(body?.serviceType)
    const beneficiaryName = asTrimmedString(body?.beneficiaryName)
    const targetAmount = Number(body?.targetAmount)
    const startDate = asTrimmedString(body?.startDate)
    const endDate = asTrimmedString(body?.endDate)
    const beneficiaryRelationship = asOptionalString(body?.beneficiaryRelationship)
    const beneficiaryDescription = asOptionalString(body?.beneficiaryDescription)
    const location = asOptionalString(body?.location)
    const coverImage = asOptionalString(body?.coverImage)
    const gallery = asStringArray(body?.gallery)
    const tags = asStringArray(body?.tags)

    if (!isDraft) {
      if (!title) return NextResponse.json({ error: 'Campaign title is required.' }, { status: 400 })
      if (!summary) return NextResponse.json({ error: 'Campaign summary is required.' }, { status: 400 })
      if (!description) return NextResponse.json({ error: 'Campaign story is required.' }, { status: 400 })
      if (!category) return NextResponse.json({ error: 'Campaign category is required.' }, { status: 400 })
      if (!serviceType) return NextResponse.json({ error: 'Campaign service type is required.' }, { status: 400 })
      if (!beneficiaryName) return NextResponse.json({ error: 'Beneficiary name is required.' }, { status: 400 })
      if (!startDate) return NextResponse.json({ error: 'Start date is required.' }, { status: 400 })
      if (!endDate) return NextResponse.json({ error: 'End date is required.' }, { status: 400 })
      if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        return NextResponse.json({ error: 'Please provide a valid target amount.' }, { status: 400 })
      }
      if (!coverImage) {
        return NextResponse.json({ error: 'A cover image is required before publishing.' }, { status: 400 })
      }
    }

    const safeTargetAmount = Number.isFinite(targetAmount) && targetAmount > 0 ? targetAmount : 0

    const campaign = await prisma.campaign.create({
      data: {
        title: title || 'Untitled campaign',
        summary: summary || 'Draft campaign summary',
        description: description || 'Draft campaign description',
        category: category || 'General',
        serviceType: serviceType || 'General',
        targetAmount: safeTargetAmount,
        startDate: startDate || '',
        endDate: endDate || '',
        beneficiaryName: beneficiaryName || 'Not specified',
        beneficiaryRelationship,
        beneficiaryDescription,
        location,
        coverImage,
        gallery: JSON.stringify(gallery),
        tags: JSON.stringify(tags),
        status: isDraft ? 'draft' : 'active',
        organiserId: session.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      status: campaign.status,
      title: campaign.title,
    })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create campaign right now.' },
      { status: 500 }
    )
  }
}
