import type { Donation } from "@/lib/types"

export type DonorFilter = "all" | "high_value" | "repeat" | "recent" | "anonymous"
export type DonorSegmentKey = Exclude<DonorFilter, "all">
export type DonorSort = "latest" | "highest" | "most_donations" | "name"

export interface DonorSummary {
  donorId: string
  donorName: string
  donorEmail?: string
  donorAvatar?: string
  donationCount: number
  totalDonated: number
  averageDonation: number
  largestDonation: number
  campaignsSupported: number
  anonymousDonationCount: number
  firstDonationAt: string
  lastDonationAt: string
  tags: string[]
}

export interface DonorSegmentCard {
  key: DonorSegmentKey
  label: string
  description: string
  count: number
  emailHref: string
}

export interface DonorActivityItem {
  donationId: string
  donorId: string
  donorName: string
  amount: number
  campaignId: string
  campaignTitle: string
  createdAt: string
  isAnonymous: boolean
}

interface DonorEntityProps {
  donorId: string
  donorName: string
  donorEmail?: string
  donorAvatar?: string
}

export function isDonorSegmentKey(value: string | null | undefined): value is DonorSegmentKey {
  return value === "high_value" || value === "repeat" || value === "recent" || value === "anonymous"
}

export function getDonorSegmentLabel(segment: DonorSegmentKey): string {
  switch (segment) {
    case "high_value":
      return "High value donors"
    case "repeat":
      return "Repeat supporters"
    case "recent":
      return "Recent supporters"
    case "anonymous":
      return "Anonymous givers"
    default:
      return "Selected donors"
  }
}

export function getDonorSegmentDescription(segment: DonorSegmentKey): string {
  switch (segment) {
    case "high_value":
      return "Supporters who contributed at least $1,000 across your campaigns."
    case "repeat":
      return "Supporters who have donated more than once and may respond well to update emails."
    case "recent":
      return "Supporters who donated recently and are good candidates for follow-up or milestone updates."
    case "anonymous":
      return "Supporters who gave anonymously. Some entries may not include a usable email address yet."
    default:
      return "Selected donor audience from the donor dashboard."
  }
}

export class Donor {
  private readonly donationHistory: Donation[] = []
  private readonly supportedCampaignIds = new Set<string>()

  constructor(private readonly props: DonorEntityProps) {}

  addDonation(donation: Donation): void {
    if (donation.donorId !== this.props.donorId) {
      throw new Error(`Donation ${donation.id} does not belong to donor ${this.props.donorId}.`)
    }

    this.donationHistory.push(donation)
    this.supportedCampaignIds.add(donation.campaignId)
  }

  getId(): string {
    return this.props.donorId
  }

  getName(): string {
    return this.props.donorName
  }

  getEmail(): string | undefined {
    return this.props.donorEmail
  }

  getAvatar(): string | undefined {
    return this.props.donorAvatar
  }

  getDonationCount(): number {
    return this.donationHistory.length
  }

  getTotalDonated(): number {
    return this.donationHistory.reduce((sum, donation) => sum + donation.amount, 0)
  }

  getAverageDonation(): number {
    const donationCount = this.getDonationCount()
    return donationCount === 0 ? 0 : this.getTotalDonated() / donationCount
  }

  getLargestDonation(): number {
    if (this.donationHistory.length === 0) return 0
    return this.donationHistory.reduce((largest, donation) => Math.max(largest, donation.amount), 0)
  }

  getCampaignsSupported(): number {
    return this.supportedCampaignIds.size
  }

  getAnonymousDonationCount(): number {
    return this.donationHistory.filter((donation) => donation.isAnonymous).length
  }

  getFirstDonationAt(): string {
    if (this.donationHistory.length === 0) return ""

    return this.donationHistory.reduce((earliest, donation) => {
      return new Date(donation.createdAt).getTime() < new Date(earliest).getTime()
        ? donation.createdAt
        : earliest
    }, this.donationHistory[0].createdAt)
  }

  getLastDonationAt(): string {
    if (this.donationHistory.length === 0) return ""

    return this.donationHistory.reduce((latest, donation) => {
      return new Date(donation.createdAt).getTime() > new Date(latest).getTime()
        ? donation.createdAt
        : latest
    }, this.donationHistory[0].createdAt)
  }

  isHighValue(threshold = 1000): boolean {
    return this.getTotalDonated() >= threshold
  }

  isRepeatDonor(minimumDonationCount = 2): boolean {
    return this.getDonationCount() >= minimumDonationCount
  }

  isRecentSupporter(recentCutoffTimestamp: number): boolean {
    const lastDonationAt = this.getLastDonationAt()
    return lastDonationAt !== "" && new Date(lastDonationAt).getTime() >= recentCutoffTimestamp
  }

  isAnonymousGiver(): boolean {
    return this.getAnonymousDonationCount() > 0
  }

  getTags(recentCutoffTimestamp: number): string[] {
    const tags: string[] = []

    if (this.isHighValue()) tags.push("High value")
    if (this.isRepeatDonor()) tags.push("Repeat donor")
    if (this.isRecentSupporter(recentCutoffTimestamp)) tags.push("Recent supporter")
    if (this.isAnonymousGiver()) tags.push("Anonymous giver")

    return tags
  }

  matchesSearch(searchQuery: string, recentCutoffTimestamp: number): boolean {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true

    return (
      this.getName().toLowerCase().includes(query) ||
      this.getEmail()?.toLowerCase().includes(query) === true ||
      this.getTags(recentCutoffTimestamp).some((tag) => tag.toLowerCase().includes(query))
    )
  }

  matchesFilter(filter: DonorFilter, recentCutoffTimestamp: number): boolean {
    switch (filter) {
      case "high_value":
        return this.isHighValue()
      case "repeat":
        return this.isRepeatDonor()
      case "recent":
        return this.isRecentSupporter(recentCutoffTimestamp)
      case "anonymous":
        return this.isAnonymousGiver()
      case "all":
      default:
        return true
    }
  }

  toSummary(recentCutoffTimestamp: number): DonorSummary {
    return {
      donorId: this.getId(),
      donorName: this.getName(),
      donorEmail: this.getEmail(),
      donorAvatar: this.getAvatar(),
      donationCount: this.getDonationCount(),
      totalDonated: this.getTotalDonated(),
      averageDonation: this.getAverageDonation(),
      largestDonation: this.getLargestDonation(),
      campaignsSupported: this.getCampaignsSupported(),
      anonymousDonationCount: this.getAnonymousDonationCount(),
      firstDonationAt: this.getFirstDonationAt(),
      lastDonationAt: this.getLastDonationAt(),
      tags: this.getTags(recentCutoffTimestamp),
    }
  }
}
