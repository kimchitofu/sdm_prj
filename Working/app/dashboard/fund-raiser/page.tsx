"use client"

import Link from "next/link"
import {
  DollarSign,
  Eye,
  Heart,
  FileText,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Calendar,
  Users,
  BarChart3,
  FolderKanban,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Card2, CardContent2, CardHeader2, CardTitle2, CardDescription2 } from "@/components/ui/card2"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { campaigns, users, analyticsData } from "@/lib/mock-data"
import { useCurrentUser } from "@/hooks/use-current-user"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const fallbackFundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]

const myCampaigns = campaigns.filter((c) => c.organiser.id === "user-2").slice(0, 8)
const activeCampaigns = myCampaigns.filter((c) => c.status === "active")
const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
const totalViews = myCampaigns.reduce((sum, c) => sum + c.views, 0)
const totalFavourites = myCampaigns.reduce((sum, c) => sum + c.favouriteCount, 0)
const totalDonations = myCampaigns.reduce((sum, c) => sum + c.donorCount, 0)

const recentActivity = [
  { type: "donation", campaign: "Clean Water Initiative", amount: 150, donor: "Sarah M.", time: "2 hours ago" },
  { type: "favourite", campaign: "Youth Education Program", time: "4 hours ago" },
  { type: "donation", campaign: "Clean Water Initiative", amount: 50, donor: "Anonymous", time: "6 hours ago" },
  { type: "view", campaign: "Medical Fund for Sarah", count: 25, time: "1 day ago" },
  { type: "donation", campaign: "Youth Education Program", amount: 200, donor: "Michael R.", time: "2 days ago" },
]

const quickActions = [
  {
    title: "New Campaign",
    href: "/dashboard/fund-raiser/campaigns/new",
    icon: PlusCircle,
  },
  {
    title: "My Campaigns",
    href: "/dashboard/fund-raiser/campaigns",
    icon: FolderKanban,
  },
  {
    title: "Analytics",
    href: "/dashboard/fund-raiser/analytics",
    icon: BarChart3,
  },
  {
    title: "History",
    href: "/dashboard/fund-raiser/history",
    icon: History,
  },
]

export default function FundRaiserDashboardPage() {
  const currentUser = useCurrentUser(fallbackFundRaiserUser)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const conversionRate = totalViews > 0 ? ((totalDonations / totalViews) * 100).toFixed(2) : "0.00"

  return (
    <DashboardLayout
      role="fund_raiser"
      user={{
        name: currentUser.displayName,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: "Fund Raiser",
      }}
    >
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Fund Raiser Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser.displayName.split(" ")[0]}! Here&apos;s your campaign overview.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatsCard
          title="Total Raised"
          value={formatCurrency(totalRaised)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Across all campaigns"
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Active Campaigns"
          value={activeCampaigns.length.toString()}
          icon={<FileText className="h-5 w-5" />}
          description="Currently running"
        />
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          description="Campaign page views"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Favourites"
          value={totalFavourites.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          description="Saved by supporters"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Views to donors"
          trend={{ value: 0.4, isPositive: true }}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card2 className="h-full transition-colors hover:bg-muted/40">
              <CardContent2 className="flex h-full items-center gap-3 p-4">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <action.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{action.title}</p>
              </CardContent2>
            </Card2>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Donations Over Time</CardTitle>
            <CardDescription>Recent fundraising momentum across your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.donationTrend}>
                  <defs>
                    <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorDonations)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest events across your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      activity.type === "donation"
                        ? "bg-azure-500/10 text-azure-600"
                        : activity.type === "favourite"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {activity.type === "donation" ? (
                      <DollarSign className="h-5 w-5" />
                    ) : activity.type === "favourite" ? (
                      <Heart className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {activity.type === "donation"
                        ? `${activity.donor} donated ${formatCurrency(activity.amount!)}`
                        : activity.type === "favourite"
                          ? "New favourite added"
                          : `${activity.count} new views`}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{activity.campaign}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top Performing Campaigns</CardTitle>
            <CardDescription>Your strongest campaigns at a glance</CardDescription>
          </div>
          <Link href="/dashboard/fund-raiser/campaigns">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myCampaigns.slice(0, 4).map((campaign) => {
              const progress = (campaign.raisedAmount / campaign.targetAmount) * 100

              return (
                <div
                  key={campaign.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img src={campaign.coverImage} alt={campaign.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="truncate font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {campaign.title}
                      </Link>
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="shrink-0">
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {campaign.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {campaign.favouriteCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(campaign.raisedAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden w-32 md:block">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Link href={`/dashboard/fund-raiser/campaigns/${campaign.id}/edit`} className="shrink-0">
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
