"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Heart,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { useAuth } from "@/components/providers/session-provider"

interface DashboardStats {
  totalDonated: number
  activeFavourites: number
  campaignsSupported: number
  thisMonth: number
}

interface RecentActivity {
  type: 'donation' | 'favourite'
  campaignId: string
  campaign: string
  amount: number | null
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  recommendedCampaigns: unknown[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(amount)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function DoneeDashboardPage() {
  const { user: sessionUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/donee/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const firstName = sessionUser?.firstName ?? ''
  const sidebarUser = sessionUser
    ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email,
        role: 'Donee',
      }
    : undefined

  return (
    <DashboardLayout role="donee" user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your giving journey and recommended campaigns.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Donated"
              value={formatCurrency(data?.stats.totalDonated ?? 0)}
              icon={<DollarSign className="h-5 w-5" />}
              description="Lifetime contributions"
            />
            <StatsCard
              title="Active Favourites"
              value={(data?.stats.activeFavourites ?? 0).toString()}
              icon={<Heart className="h-5 w-5" />}
              description="Saved campaigns"
            />
            <StatsCard
              title="Campaigns Supported"
              value={(data?.stats.campaignsSupported ?? 0).toString()}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Total campaigns"
            />
            <StatsCard
              title="This Month"
              value={formatCurrency(data?.stats.thisMonth ?? 0)}
              icon={<Clock className="h-5 w-5" />}
              description="Recent giving"
            />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/browse" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>
                <Link href="/dashboard/donee/favourites" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    View Favourites
                  </Button>
                </Link>
                <Link href="/dashboard/donee/donations" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Donation History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </div>
                <Link href="/dashboard/donee/donations">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {(data?.recentActivity ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity yet. Start by browsing campaigns!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(data?.recentActivity ?? []).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'donation'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent-foreground'
                        }`}>
                          {activity.type === 'donation'
                            ? <DollarSign className="h-5 w-5" />
                            : <Heart className="h-5 w-5" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {activity.type === 'donation' ? 'Donated to' : 'Saved'} {activity.campaign}
                          </p>
                          <p className="text-sm text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                        </div>
                        {activity.amount !== null && (
                          <Badge variant="secondary" className="font-semibold">
                            {formatCurrency(activity.amount)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Campaigns */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Recommended For You</h2>
              </div>
              <Link href="/browse">
                <Button variant="ghost" size="sm">
                  Browse All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {(data?.recommendedCampaigns ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No active campaigns at the moment.</p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {(data?.recommendedCampaigns ?? []).map((campaign) => (
                  <CampaignCard key={(campaign as {id: string}).id} campaign={campaign as never} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  )
}
