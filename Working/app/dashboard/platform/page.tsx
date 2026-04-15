"use client"

import Link from "next/link"
import { 
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Activity,
  Eye,
  Heart,
  Folders,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { campaigns, users, categories, analyticsData } from "@/lib/mock-data"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

const platformUser = {
  displayName: 'Platform Manager',
  email: 'manager@fundbridge.org',
  role: 'Platform Manager'
}

// Platform stats
const totalUsers = users.length
const activeCampaigns = campaigns.filter(c => c.status === 'active').length
const completedCampaigns = campaigns.filter(c => c.status === 'completed').length
const totalDonations = campaigns.reduce((sum, c) => sum + c.donorCount, 0)
const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0)

// Top categories
const categoryStats = categories.slice(0, 5).map(cat => ({
  name: cat.name,
  campaigns: campaigns.filter(c => c.category === cat.name).length,
  raised: campaigns.filter(c => c.category === cat.name).reduce((sum, c) => sum + c.raisedAmount, 0)
}))

// Top campaigns
const topCampaigns = [...campaigns].sort((a, b) => b.views - a.views).slice(0, 5)

export default function PlatformDashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <DashboardLayout 
      role="platform_management"
      user={{
        name: platformUser.displayName,
        email: platformUser.email,
        role: 'Platform Manager'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of FundBridge platform operations and metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/platform/reports">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
          <Link href="/dashboard/platform/categories">
            <Button>
              <Folders className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          description="Registered users"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Campaigns"
          value={activeCampaigns.toString()}
          icon={<FileText className="h-5 w-5" />}
          description="Currently running"
        />
        <StatsCard
          title="Completed"
          value={completedCampaigns.toString()}
          icon={<Activity className="h-5 w-5" />}
          description="Finished campaigns"
        />
        <StatsCard
          title="Total Donations"
          value={totalDonations.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          description="All time"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Raised"
          value={formatCurrency(totalRaised)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Platform total"
          trend={{ value: 22, isPositive: true }}
        />
        <StatsCard
          title="Total Views"
          value={(totalViews / 1000).toFixed(1) + 'K'}
          icon={<Eye className="h-5 w-5" />}
          description="Campaign views"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donation Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Donation Volume</CardTitle>
            <CardDescription>Daily donation amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.donationTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories & Campaigns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Categories</CardTitle>
              <CardDescription>Most active fundraising categories</CardDescription>
            </div>
            <Link href="/dashboard/platform/categories">
              <Button variant="ghost" size="sm">
                Manage
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={category.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.campaigns} campaigns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(category.raised / totalRaised) * 100} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-primary">{formatCurrency(category.raised)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Most Viewed Campaigns</CardTitle>
              <CardDescription>Highest traffic campaigns</CardDescription>
            </div>
            <Link href="/dashboard/platform/reports">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/campaign/${campaign.id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                      {campaign.title}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {campaign.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {campaign.favouriteCount}
                      </span>
                      <Badge variant="outline" className="text-xs">{campaign.category}</Badge>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(campaign.raisedAmount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
