"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuth } from "@/components/providers/session-provider"

function formatCurrency(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

type DashboardData = {
  stats: {
    totalRaised: number
    totalDonations: number
    avgDonation: number
    activeCampaigns: number
  }
  dailyStats: { date: string; amount: number; count: number }[]
  categoryBreakdown: { name: string; value: number }[]
  recentDonations: {
    id: string
    donorName: string
    isAnonymous: boolean
    amount: number
    status: string
    createdAt: string
    campaignTitle: string
    category: string
  }[]
}

export default function AdminDashboardPage() {
  const { user: sessionUser } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionUser && sessionUser.role === 'campaign_admin') {
      router.replace('/dashboard/admin/campaign-dashboard')
    }
  }, [sessionUser, router])

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const sidebarUser = sessionUser
    ? { name: `${sessionUser.firstName} ${sessionUser.lastName}`, email: sessionUser.email, role: sessionUser.role }
    : undefined

  return (
    <DashboardLayout role="admin" user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Donation activity and platform overview.</p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground">Loading dashboard...</div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Raised"
              value={formatCurrency(data?.stats.totalRaised ?? 0)}
              icon={<DollarSign className="h-5 w-5" />}
              description="All completed donations"
            />
            <StatsCard
              title="Total Donations"
              value={(data?.stats.totalDonations ?? 0).toLocaleString()}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Transactions"
            />
            <StatsCard
              title="Avg Donation"
              value={formatCurrency(data?.stats.avgDonation ?? 0)}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Per transaction"
            />
            <StatsCard
              title="Active Campaigns"
              value={(data?.stats.activeCampaigns ?? 0).toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              description="Currently running"
            />
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
