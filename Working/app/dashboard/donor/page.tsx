"use client"

import Link from "next/link"
import {
  Heart,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { campaigns, donations, users } from "@/lib/mock-data"
import { useCurrentUser } from "@/hooks/use-current-user"

const fallbackDonorUser = users.find(u => u.role === 'donor') || users.find(u => u.role === 'donee') || users[0]

const donorStats = {
  totalDonated: 1850,
  activeFavourites: 5,
  campaignsSupported: 9,
  thisMonth: 250,
}

const recentActivity = [
  { type: 'donation', campaign: 'Help Fund Jake\'s Cancer Treatment', amount: 150, date: '1 hour ago' },
  { type: 'favourite', campaign: 'Scholarships for Underprivileged Students', date: '2 days ago' },
  { type: 'donation', campaign: 'Flood Relief for Affected Families', amount: 200, date: '5 days ago' },
  { type: 'receipt', campaign: 'Help Fund Jake\'s Cancer Treatment', date: '1 hour ago' },
]

const recommendedCampaigns = campaigns.filter(c => c.status === 'active').slice(0, 4)

export default function DonorDashboardPage() {
  const currentUser = useCurrentUser(fallbackDonorUser)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  return (
    <DashboardLayout
      role="donor"
      user={{
        name: currentUser.displayName,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: 'Donor',
      }}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, {currentUser.displayName.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your giving journey and recommended campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Donated"
          value={formatCurrency(donorStats.totalDonated)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Lifetime contributions"
          trend={{ value: 10, isPositive: true }}
        />
        <StatsCard
          title="Active Favourites"
          value={donorStats.activeFavourites.toString()}
          icon={<Heart className="h-5 w-5" />}
          description="Saved campaigns"
        />
        <StatsCard
          title="Campaigns Supported"
          value={donorStats.campaignsSupported.toString()}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Total campaigns"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(donorStats.thisMonth)}
          icon={<Clock className="h-5 w-5" />}
          description="Recent giving"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
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
            <Link href="/dashboard/donor/favourites" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                View Favourites
              </Button>
            </Link>
            <Link href="/dashboard/donor/donations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Donation History
              </Button>
            </Link>
            <Link href="/dashboard/donor/donations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                My Receipts
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </div>
            <Link href="/dashboard/donor/donations">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'donation'
                        ? 'bg-primary/10 text-primary'
                        : activity.type === 'receipt'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-accent/10 text-accent-foreground'
                    }`}
                  >
                    {activity.type === 'donation' ? (
                      <DollarSign className="h-5 w-5" />
                    ) : activity.type === 'receipt' ? (
                      <Receipt className="h-5 w-5" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {activity.type === 'donation'
                        ? `Donated to ${activity.campaign}`
                        : activity.type === 'receipt'
                        ? `Receipt downloaded — ${activity.campaign}`
                        : `Saved ${activity.campaign}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  {activity.amount && (
                    <Badge variant="secondary" className="font-semibold">
                      {formatCurrency(activity.amount)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
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
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {recommendedCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}
