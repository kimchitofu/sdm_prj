// User and Authentication Types
export type UserRole = 'donee' | 'fund_raiser' | 'admin' | 'platform_manager'

export interface User {
  id: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  location?: string
  avatar?: string
  bio?: string
  isVerified: boolean
  status: 'active' | 'suspended' | 'deactivated'
  createdAt: string
  lastLoginAt?: string
}

// Campaign Types
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'suspended' | 'cancelled'

export type ServiceType = 
  | 'medical'
  | 'education'
  | 'emergency'
  | 'community'
  | 'environment'
  | 'animals'
  | 'creative'
  | 'business'
  | 'sports'
  | 'memorial'
  | 'other'

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  campaignCount: number
  isActive: boolean
  createdAt: string
}

export interface CampaignOrganiser {
  id: string
  name: string
  avatar?: string
  isVerified: boolean
  totalCampaigns: number
  totalRaised: number
}

export interface CampaignBeneficiary {
  name: string
  relationship?: string
  description?: string
}

export interface CampaignUpdate {
  id: string
  campaignId: string
  title: string
  content: string
  createdAt: string
}

export interface Campaign {
  id: string
  title: string
  summary: string
  description: string
  category: string
  serviceType: ServiceType
  status: CampaignStatus
  targetAmount: number
  raisedAmount: number
  donorCount: number
  views: number
  favouriteCount: number
  startDate: string
  endDate: string
  organiser: CampaignOrganiser
  beneficiary: CampaignBeneficiary
  coverImage: string
  gallery: string[]
  updates: CampaignUpdate[]
  createdAt: string
  completedAt?: string
  location?: string
  tags?: string[]
}

// Donation Types
export type DonationStatus = 'completed' | 'pending' | 'refunded' | 'failed'

export interface Donation {
  id: string
  campaignId: string
  campaignTitle: string
  campaignImage: string
  category: string
  donorId: string
  donorName: string
  amount: number
  message?: string
  isAnonymous: boolean
  status: DonationStatus
  createdAt: string
}

// Favourite Types
export interface Favourite {
  id: string
  userId: string
  campaignId: string
  campaign: Campaign
  createdAt: string
}

// Analytics Types
export interface CampaignAnalytics {
  campaignId: string
  date: string
  views: number
  favourites: number
  donations: number
  amount: number
}

export interface DailyStats {
  date: string
  users: number
  campaigns: number
  donations: number
  amount: number
  views: number
}

export interface PlatformStats {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalFundRaisers: number
  totalDonees: number
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalDonations: number
  totalDonationAmount: number
  averageDonation: number
}

export interface ReportSummary {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
  stats: PlatformStats
  topCampaigns: Campaign[]
  topCategories: { category: string; count: number; amount: number }[]
  insights: string[]
}

// Notification Types
export type NotificationType = 
  | 'donation_received'
  | 'campaign_update'
  | 'campaign_milestone'
  | 'campaign_ended'
  | 'new_favourite'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

// Filter and Search Types
export interface CampaignFilters {
  keyword?: string
  category?: string
  serviceType?: ServiceType
  status?: CampaignStatus
  minProgress?: number
  maxProgress?: number
  startDate?: string
  endDate?: string
  sortBy?: 'newest' | 'ending_soon' | 'most_viewed' | 'most_favourited' | 'highest_funded' | 'most_donors'
}

export interface DonationFilters {
  category?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface UserFilters {
  role?: UserRole
  status?: 'active' | 'suspended' | 'deactivated'
  startDate?: string
  endDate?: string
  keyword?: string
}
