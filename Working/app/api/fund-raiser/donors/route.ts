import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import type {
  DonorActivityItem,
  DonorFilter,
  DonorSegmentCard,
  DonorSegmentKey,
  DonorSort,
  DonorSummary,
} from "@/app/entity/Donor"
import {
  getDonorSegmentDescription,
  getDonorSegmentLabel,
  isDonorSegmentKey,
} from "@/app/entity/Donor"

type DonorDashboardStats = {
  totalRaised: number
  averageDonorValue: number
  repeatDonorCount: number
  highValueDonorCount: number
}

type DonationRow = {
  id: string
  campaignId: string
  donorId: string | null
  donorName: string | null
  donorEmail: string | null
  amount: unknown
  isAnonymous: boolean
  status: string
  createdAt: Date | string
}

type CampaignRow = {
  id: string
  title: string
}

type DonorUserRow = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
}

const DONOR_FILTERS: DonorFilter[] = ["all", "high_value", "repeat", "recent", "anonymous"]
const DONOR_SORTS: DonorSort[] = ["latest", "highest", "most_donations", "name"]
const SEGMENTS: DonorSegmentKey[] = ["high_value", "repeat", "recent", "anonymous"]

function toIsoString(value: unknown): string {
  if (!value) return new Date(0).toISOString()
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString()
  }
  return new Date(value as string | number | Date).toISOString()
}

function toPositiveInt(input: string | null, fallback: number, max?: number) {
  const parsed = Number.parseInt(input || "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return typeof max === "number" ? Math.min(parsed, max) : parsed
}

function normaliseFilter(input: string | null): DonorFilter {
  return DONOR_FILTERS.includes(input as DonorFilter) ? (input as DonorFilter) : "all"
}

function normaliseSort(input: string | null): DonorSort {
  return DONOR_SORTS.includes(input as DonorSort) ? (input as DonorSort) : "latest"
}

function buildEmailSegmentHref(segment: DonorSegmentKey, campaignId?: string): string {
  const query = campaignId ? `?segment=${segment}&campaignId=${campaignId}` : `?segment=${segment}`
  return `/dashboard/fund-raiser/emails${query}`
}

function getRecentCutoffTimestamp(donations: DonationRow[]): number {
  const latestDonationTimestamp = donations.reduce((latest, donation) => {
    return Math.max(latest, new Date(donation.createdAt).getTime())
  }, 0)

  return latestDonationTimestamp - 1000 * 60 * 60 * 24 * 21
}

function buildTags(summary: Omit<DonorSummary, "tags">, recentCutoffTimestamp: number): string[] {
  const tags: string[] = []

  if (summary.totalDonated >= 1000) tags.push("High value")
  if (summary.donationCount >= 2) tags.push("Repeat donor")
  if (summary.lastDonationAt && new Date(summary.lastDonationAt).getTime() >= recentCutoffTimestamp) {
    tags.push("Recent supporter")
  }
  if (summary.anonymousDonationCount > 0) tags.push("Anonymous giver")

  return tags
}

function buildDonorSummaries(
  donations: DonationRow[],
  donorUsersById: Map<string, DonorUserRow>,
  recentCutoffTimestamp: number
): DonorSummary[] {
  const donorsByKey = new Map<
    string,
    {
      donorId: string
      donorName: string
      donorEmail?: string
      donorAvatar?: string
      donations: DonationRow[]
      campaignIds: Set<string>
    }
  >()

  for (const donation of donations) {
    const donorUser = donation.donorId ? donorUsersById.get(donation.donorId) : undefined
    const isAnonymous = Boolean(donation.isAnonymous)
    const donationEmail = typeof donation.donorEmail === "string" ? donation.donorEmail.trim() : ""
    const donationName = typeof donation.donorName === "string" ? donation.donorName.trim() : ""
    const donorUserName = donorUser ? `${donorUser.firstName} ${donorUser.lastName}`.trim() : ""
    const donorKey = isAnonymous
      ? `anonymous-${donation.id}`
      : donation.donorId || donationEmail.toLowerCase() || `guest-${donation.id}`
    const donorName = isAnonymous
      ? "Anonymous donor"
      : donorUserName || donationName || donationEmail || "Unknown donor"
    const donorEmail = isAnonymous ? undefined : donorUser?.email || donationEmail || undefined
    const donorAvatar = isAnonymous ? undefined : donorUser?.avatar || undefined

    const current = donorsByKey.get(donorKey) || {
      donorId: donorKey,
      donorName,
      donorEmail,
      donorAvatar,
      donations: [],
      campaignIds: new Set<string>(),
    }

    current.donations.push(donation)
    current.campaignIds.add(donation.campaignId)
    donorsByKey.set(donorKey, current)
  }

  return Array.from(donorsByKey.values()).map((donor) => {
    const amounts = donor.donations.map((donation) => Number(donation.amount || 0))
    const totalDonated = amounts.reduce((sum, amount) => sum + amount, 0)
    const donationCount = donor.donations.length
    const firstDonationAt = donor.donations.reduce((earliest, donation) => {
      return new Date(donation.createdAt).getTime() < new Date(earliest).getTime()
        ? toIsoString(donation.createdAt)
        : earliest
    }, toIsoString(donor.donations[0]?.createdAt))
    const lastDonationAt = donor.donations.reduce((latest, donation) => {
      return new Date(donation.createdAt).getTime() > new Date(latest).getTime()
        ? toIsoString(donation.createdAt)
        : latest
    }, toIsoString(donor.donations[0]?.createdAt))

    const summaryWithoutTags: Omit<DonorSummary, "tags"> = {
      donorId: donor.donorId,
      donorName: donor.donorName,
      donorEmail: donor.donorEmail,
      donorAvatar: donor.donorAvatar,
      donationCount,
      totalDonated,
      averageDonation: donationCount > 0 ? totalDonated / donationCount : 0,
      largestDonation: amounts.length > 0 ? Math.max(...amounts) : 0,
      campaignsSupported: donor.campaignIds.size,
      anonymousDonationCount: donor.donations.filter((donation) => donation.isAnonymous).length,
      firstDonationAt,
      lastDonationAt,
    }

    return {
      ...summaryWithoutTags,
      tags: buildTags(summaryWithoutTags, recentCutoffTimestamp),
    }
  })
}

function matchesSegment(donor: DonorSummary, segment: DonorSegmentKey, recentCutoffTimestamp: number): boolean {
  switch (segment) {
    case "high_value":
      return donor.totalDonated >= 1000
    case "repeat":
      return donor.donationCount >= 2
    case "recent":
      return new Date(donor.lastDonationAt).getTime() >= recentCutoffTimestamp
    case "anonymous":
      return donor.anonymousDonationCount > 0
    default:
      return false
  }
}

function filterAndSortDonors(
  donors: DonorSummary[],
  searchQuery: string,
  filter: DonorFilter,
  sortBy: DonorSort,
  recentCutoffTimestamp: number
): DonorSummary[] {
  const normalisedQuery = searchQuery.trim().toLowerCase()

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      !normalisedQuery ||
      donor.donorName.toLowerCase().includes(normalisedQuery) ||
      donor.donorEmail?.toLowerCase().includes(normalisedQuery) ||
      donor.tags.some((tag) => tag.toLowerCase().includes(normalisedQuery))

    const matchesFilter =
      filter === "all" ||
      (filter === "high_value" && donor.totalDonated >= 1000) ||
      (filter === "repeat" && donor.donationCount >= 2) ||
      (filter === "recent" && new Date(donor.lastDonationAt).getTime() >= recentCutoffTimestamp) ||
      (filter === "anonymous" && donor.anonymousDonationCount > 0)

    return matchesSearch && matchesFilter
  })

  return filteredDonors.sort((firstDonor, secondDonor) => {
    switch (sortBy) {
      case "highest":
        return secondDonor.totalDonated - firstDonor.totalDonated
      case "most_donations":
        return secondDonor.donationCount - firstDonor.donationCount
      case "name":
        return firstDonor.donorName.localeCompare(secondDonor.donorName)
      case "latest":
      default:
        return new Date(secondDonor.lastDonationAt).getTime() - new Date(firstDonor.lastDonationAt).getTime()
    }
  })
}

function buildStats(donorSummary: DonorSummary[]): DonorDashboardStats {
  const totalRaised = donorSummary.reduce((sum, donor) => sum + donor.totalDonated, 0)
  const averageDonorValue = donorSummary.length > 0 ? totalRaised / donorSummary.length : 0

  return {
    totalRaised,
    averageDonorValue,
    repeatDonorCount: donorSummary.filter((donor) => donor.donationCount >= 2).length,
    highValueDonorCount: donorSummary.filter((donor) => donor.totalDonated >= 1000).length,
  }
}

function buildSegmentCards(
  donors: DonorSummary[],
  recentCutoffTimestamp: number,
  suggestedCampaignId?: string
): DonorSegmentCard[] {
  return SEGMENTS.map((segment) => ({
    key: segment,
    label: getDonorSegmentLabel(segment),
    description: getDonorSegmentDescription(segment),
    count: donors.filter((donor) => matchesSegment(donor, segment, recentCutoffTimestamp)).length,
    emailHref: buildEmailSegmentHref(segment, suggestedCampaignId),
  }))
}

function buildRecentActivity(
  donations: DonationRow[],
  campaignTitleById: Map<string, string>
): DonorActivityItem[] {
  return [...donations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((donation) => ({
      donationId: donation.id,
      donorId: donation.donorId || `anonymous-${donation.id}`,
      donorName: donation.isAnonymous ? "Anonymous donor" : donation.donorName || donation.donorEmail || "Unknown donor",
      amount: Number(donation.amount || 0),
      campaignId: donation.campaignId,
      campaignTitle: campaignTitleById.get(donation.campaignId) || "Campaign",
      createdAt: toIsoString(donation.createdAt),
      isAnonymous: Boolean(donation.isAnonymous),
    }))
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize
  return items.slice(startIndex, startIndex + pageSize)
}

async function buildResponsePayload(request: NextRequest, fundRaiserId: string) {
  const url = new URL(request.url)
  const searchQuery = url.searchParams.get("searchQuery") || ""
  const filter = normaliseFilter(url.searchParams.get("filter"))
  const sortBy = normaliseSort(url.searchParams.get("sortBy"))
  const donorPage = toPositiveInt(url.searchParams.get("donorPage"), 1)
  const donorPageSize = toPositiveInt(url.searchParams.get("donorPageSize"), 8, 50)
  const activityPage = toPositiveInt(url.searchParams.get("activityPage"), 1)
  const activityPageSize = toPositiveInt(url.searchParams.get("activityPageSize"), 4, 50)

  const fundRaiser = await prisma.user.findUnique({
    where: { id: fundRaiserId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  })

  if (!fundRaiser) {
    throw new Error("Fund raiser account was not found.")
  }

  const campaigns = (await prisma.campaign.findMany({
    where: { organiserId: fundRaiserId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  })) as CampaignRow[]

  const campaignIds = campaigns.map((campaign) => campaign.id)
  const campaignTitleById = new Map(campaigns.map((campaign) => [campaign.id, campaign.title]))

  const donations = campaignIds.length
    ? ((await prisma.donation.findMany({
        where: {
          campaignId: { in: campaignIds },
          status: "completed",
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          campaignId: true,
          donorId: true,
          donorName: true,
          donorEmail: true,
          amount: true,
          isAnonymous: true,
          status: true,
          createdAt: true,
        },
      })) as DonationRow[])
    : []

  const donorIds = Array.from(
    new Set(donations.map((donation) => donation.donorId).filter((value): value is string => Boolean(value)))
  )

  const donorUsers = donorIds.length
    ? ((await prisma.user.findMany({
        where: { id: { in: donorIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      })) as DonorUserRow[])
    : []

  const donorUsersById = new Map(donorUsers.map((user) => [user.id, user]))
  const recentCutoffTimestamp = getRecentCutoffTimestamp(donations)
  const donorSummary = buildDonorSummaries(donations, donorUsersById, recentCutoffTimestamp)
  const filteredDonors = filterAndSortDonors(donorSummary, searchQuery, filter, sortBy, recentCutoffTimestamp)
  const recentActivity = buildRecentActivity(donations, campaignTitleById)
  const suggestedCampaignId = campaigns[0]?.id
  const donorTotalPages = Math.max(1, Math.ceil(filteredDonors.length / donorPageSize))
  const activityTotalPages = Math.max(1, Math.ceil(recentActivity.length / activityPageSize))
  const safeDonorPage = Math.min(donorPage, donorTotalPages)
  const safeActivityPage = Math.min(activityPage, activityTotalPages)

  return {
    currentUser: {
      id: fundRaiser.id,
      email: fundRaiser.email,
      displayName: `${fundRaiser.firstName} ${fundRaiser.lastName}`.trim() || "Fund Raiser",
      avatar: fundRaiser.avatar || undefined,
    },
    dashboard: {
      donorSummary,
      filteredDonors: paginate(filteredDonors, safeDonorPage, donorPageSize),
      recentActivity: paginate(recentActivity, safeActivityPage, activityPageSize),
      topDonors: [...donorSummary].sort((a, b) => b.totalDonated - a.totalDonated).slice(0, 3),
      stats: buildStats(donorSummary),
      segmentCards: buildSegmentCards(donorSummary, recentCutoffTimestamp, suggestedCampaignId),
      currentFilterEmailHref: isDonorSegmentKey(filter) ? buildEmailSegmentHref(filter, suggestedCampaignId) : undefined,
    },
    donorsMeta: {
      page: safeDonorPage,
      pageSize: donorPageSize,
      totalCount: filteredDonors.length,
      totalPages: donorTotalPages,
    },
    recentActivityMeta: {
      page: safeActivityPage,
      pageSize: activityPageSize,
      totalCount: recentActivity.length,
      totalPages: activityTotalPages,
    },
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session || session.role !== "fund_raiser") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await buildResponsePayload(request, session.id)
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load donor dashboard." },
      { status: 500 }
    )
  }
}
