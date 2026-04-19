import {
  Donor,
  type DonorActivityItem,
  type DonorFilter,
  type DonorSegmentCard,
  type DonorSegmentKey,
  type DonorSort,
  type DonorSummary,
  getDonorSegmentDescription,
  getDonorSegmentLabel,
  isDonorSegmentKey,
} from "@/app/entity/Donor"
import type { Campaign, Donation, User } from "@/lib/types"

interface StoredUserLike {
  id?: string
  email?: string
}

export interface DonorDashboardStats {
  totalRaised: number
  averageDonorValue: number
  repeatDonorCount: number
  highValueDonorCount: number
}

export interface DonorDashboardViewModel {
  fundRaiserCampaigns: Campaign[]
  donorSummary: DonorSummary[]
  filteredDonors: DonorSummary[]
  recentActivity: DonorActivityItem[]
  topDonors: DonorSummary[]
  campaignTitleById: Map<string, string>
  stats: DonorDashboardStats
  segmentCards: DonorSegmentCard[]
  currentFilterEmailHref?: string
}

export class DonorDashboardController {
  constructor(
    private readonly campaigns: Campaign[],
    private readonly donations: Donation[],
    private readonly users: User[]
  ) {}

  getDefaultFundRaiserUser(): User | undefined {
    return this.users.find((user) => user.role === "fund_raiser")
  }

  resolveFundRaiserUser(storedUser: StoredUserLike): User | undefined {
    return this.users.find((user) => user.id === storedUser.id || user.email === storedUser.email)
  }

  getFundRaiserCampaigns(fundRaiserUserId: string): Campaign[] {
    return this.campaigns.filter((campaign) => campaign.organiser.id === fundRaiserUserId)
  }

  buildDashboard(
    fundRaiserUserId: string,
    options?: {
      searchQuery?: string
      filter?: DonorFilter
      sortBy?: DonorSort
    }
  ): DonorDashboardViewModel {
    const searchQuery = options?.searchQuery ?? ""
    const filter = options?.filter ?? "all"
    const sortBy = options?.sortBy ?? "latest"

    const fundRaiserCampaigns = this.getFundRaiserCampaigns(fundRaiserUserId)
    const campaignTitleById = new Map(fundRaiserCampaigns.map((campaign) => [campaign.id, campaign.title]))
    const fundRaiserCampaignIds = new Set(fundRaiserCampaigns.map((campaign) => campaign.id))

    const relevantDonations = this.donations.filter(
      (donation) => donation.status === "completed" && fundRaiserCampaignIds.has(donation.campaignId)
    )

    const recentCutoffTimestamp = this.getRecentCutoffTimestamp(relevantDonations)
    const donorSummary = this.buildDonorSummaries(relevantDonations, recentCutoffTimestamp)
    const suggestedCampaignId = fundRaiserCampaigns[0]?.id

    return {
      fundRaiserCampaigns,
      donorSummary,
      filteredDonors: this.filterAndSortDonors(donorSummary, searchQuery, filter, sortBy),
      recentActivity: this.buildRecentActivity(relevantDonations, campaignTitleById),
      topDonors: [...donorSummary].sort((a, b) => b.totalDonated - a.totalDonated).slice(0, 3),
      campaignTitleById,
      stats: this.buildStats(donorSummary),
      segmentCards: this.buildSegmentCards(donorSummary, recentCutoffTimestamp, suggestedCampaignId),
      currentFilterEmailHref: isDonorSegmentKey(filter)
        ? this.buildEmailSegmentHref(filter, suggestedCampaignId)
        : undefined,
    }
  }

  buildEmailSegmentHref(segment: DonorSegmentKey, campaignId?: string): string {
    const query = campaignId ? `?segment=${segment}&campaignId=${campaignId}` : `?segment=${segment}`
    return `/dashboard/fund-raiser/emails${query}`
  }

  private buildDonorSummaries(relevantDonations: Donation[], recentCutoffTimestamp: number): DonorSummary[] {
    const donorsById = new Map<string, Donor>()

    for (const donation of relevantDonations) {
      const donorUser = this.users.find((user) => user.id === donation.donorId)
      const donor =
        donorsById.get(donation.donorId) ??
        new Donor({
          donorId: donation.donorId,
          donorName: donorUser?.displayName || donation.donorName || "Unknown donor",
          donorEmail: donorUser?.email,
          donorAvatar: donorUser?.avatar,
        })

      donor.addDonation(donation)
      donorsById.set(donation.donorId, donor)
    }

    return Array.from(donorsById.values()).map((donor) => donor.toSummary(recentCutoffTimestamp))
  }

  private filterAndSortDonors(
    donors: DonorSummary[],
    searchQuery: string,
    filter: DonorFilter,
    sortBy: DonorSort
  ): DonorSummary[] {
    const recentCutoffTimestamp = this.getRecentCutoffTimestampFromSummaries(donors)
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

  private buildSegmentCards(
    donors: DonorSummary[],
    recentCutoffTimestamp: number,
    suggestedCampaignId?: string
  ): DonorSegmentCard[] {
    const segments: DonorSegmentKey[] = ["high_value", "repeat", "recent", "anonymous"]

    return segments.map((segment) => ({
      key: segment,
      label: getDonorSegmentLabel(segment),
      description: getDonorSegmentDescription(segment),
      count: donors.filter((donor) => this.matchesSegment(donor, segment, recentCutoffTimestamp)).length,
      emailHref: this.buildEmailSegmentHref(segment, suggestedCampaignId),
    }))
  }

  private matchesSegment(donor: DonorSummary, segment: DonorSegmentKey, recentCutoffTimestamp: number): boolean {
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

  private buildRecentActivity(
    donations: Donation[],
    campaignTitleById: Map<string, string>
  ): DonorActivityItem[] {
    return [...donations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((donation) => ({
        donationId: donation.id,
        donorId: donation.donorId,
        donorName: donation.isAnonymous ? "Anonymous donor" : donation.donorName,
        amount: donation.amount,
        campaignId: donation.campaignId,
        campaignTitle: campaignTitleById.get(donation.campaignId) || donation.campaignTitle,
        createdAt: donation.createdAt,
        isAnonymous: donation.isAnonymous,
      }))
  }

  private buildStats(donorSummary: DonorSummary[]): DonorDashboardStats {
    const totalRaised = donorSummary.reduce((sum, donor) => sum + donor.totalDonated, 0)
    const averageDonorValue = donorSummary.length > 0 ? totalRaised / donorSummary.length : 0
    const repeatDonorCount = donorSummary.filter((donor) => donor.donationCount >= 2).length
    const highValueDonorCount = donorSummary.filter((donor) => donor.totalDonated >= 1000).length

    return {
      totalRaised,
      averageDonorValue,
      repeatDonorCount,
      highValueDonorCount,
    }
  }

  private getRecentCutoffTimestamp(relevantDonations: Donation[]): number {
    const latestDonationTimestamp = relevantDonations.reduce((latest, donation) => {
      return Math.max(latest, new Date(donation.createdAt).getTime())
    }, 0)

    return latestDonationTimestamp - 1000 * 60 * 60 * 24 * 21
  }

  private getRecentCutoffTimestampFromSummaries(donors: DonorSummary[]): number {
    const latestDonationTimestamp = donors.reduce((latest, donor) => {
      return Math.max(latest, new Date(donor.lastDonationAt).getTime())
    }, 0)

    return latestDonationTimestamp - 1000 * 60 * 60 * 24 * 21
  }
}
