
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Eye,
  Heart,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Lightbulb,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { campaigns, users, analyticsData } from "@/lib/mock-data"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const fundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]
const activeCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 6)

const categoryColors = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const baseInsights = [
  {
    type: "warning",
    title: "Low Conversion Rate",
    message:
      '"Youth Education Program" has high traffic but relatively few donors. Consider updating the campaign story or adding a recent progress update.',
    campaign: campaigns[1],
  },
  {
    type: "success",
    title: "High Engagement",
    message:
      '"Clean Water Initiative" is converting interest into donations more strongly than your other active campaigns.',
    campaign: campaigns[0],
  },
  {
    type: "tip",
    title: "Optimization Tip",
    message:
      "Campaigns with fresh updates usually perform better. Consider posting a short update for campaigns with slowing engagement.",
    campaign: null,
  },
]

type DateRangeOption = "7d" | "30d" | "90d" | "1y"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d")
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all")

  const selectedCampaigns = useMemo(() => {
    if (selectedCampaign === "all") return activeCampaigns
    return activeCampaigns.filter((campaign) => campaign.id === selectedCampaign)
  }, [selectedCampaign])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const sliceTrendByDateRange = <T,>(data: T[]) => {
    if (!Array.isArray(data) || data.length === 0) return []

    const pointCount =
      dateRange === "7d" ? 7 :
      dateRange === "30d" ? 30 :
      dateRange === "90d" ? 90 :
      365

    return data.slice(-Math.min(pointCount, data.length))
  }

  const trendData = useMemo(() => sliceTrendByDateRange(analyticsData.viewsTrend), [dateRange])
  const donationTrendData = useMemo(() => sliceTrendByDateRange(analyticsData.donationTrend), [dateRange])

  const totalViews = selectedCampaigns.reduce((sum, c) => sum + c.views, 0)
  const totalFavourites = selectedCampaigns.reduce((sum, c) => sum + c.favouriteCount, 0)
  const totalDonations = selectedCampaigns.reduce((sum, c) => sum + c.donorCount, 0)
  const totalRaised = selectedCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
  const conversionRate = totalViews > 0 ? ((totalDonations / totalViews) * 100).toFixed(2) : "0.00"

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>()

    for (const campaign of selectedCampaigns) {
      grouped.set(campaign.category, (grouped.get(campaign.category) || 0) + campaign.raisedAmount)
    }

    const entries = Array.from(grouped.entries()).map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[index % categoryColors.length],
    }))

    return entries.length > 0 ? entries : [{ name: "No data", value: 1, color: "hsl(var(--muted))" }]
  }, [selectedCampaigns])

  const viewsVsFavouritesData = useMemo(() => {
    return selectedCampaigns.map((campaign) => ({
      name: campaign.title.length > 20 ? `${campaign.title.slice(0, 20)}…` : campaign.title,
      views: campaign.views,
      favourites: campaign.favouriteCount,
    }))
  }, [selectedCampaigns])

  const insights = useMemo(() => {
    if (selectedCampaign === "all") return baseInsights

    const campaign = activeCampaigns.find((item) => item.id === selectedCampaign)
    if (!campaign) return baseInsights

    const rate = campaign.views > 0 ? (campaign.donorCount / campaign.views) * 100 : 0

    return [
      {
        type: rate < 1 ? "warning" : "success",
        title: rate < 1 ? "Conversion Needs Attention" : "Healthy Conversion",
        message:
          rate < 1
            ? `"${campaign.title}" is attracting views but converting at a low rate. Consider refreshing the story, imagery, or call-to-action.`
            : `"${campaign.title}" is performing well relative to its traffic. Keep momentum up with updates and shares.`,
        campaign,
      },
      {
        type: "tip",
        title: "Next Best Action",
        message:
          campaign.favouriteCount > campaign.donorCount
            ? "You have more shortlist interest than donors. A campaign update or stronger donation prompt could help convert interest."
            : "Engagement is translating relatively well. Consider promoting this campaign more widely while it is performing strongly.",
        campaign,
      },
    ]
  }, [selectedCampaign])

  return (
    <DashboardLayout
      role="fund_raiser"
      user={{
        name: fundRaiserUser.displayName,
        email: fundRaiserUser.email,
        avatar: fundRaiserUser.avatar,
        role: "Fund Raiser",
      }}
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Campaign Analytics
          </h1>
          <p className="text-muted-foreground">
            Track interest and performance across your fundraising activities.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All active campaigns</SelectItem>
              {activeCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeOption)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          description="Campaign page views"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Favourites"
          value={totalFavourites.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          description="Saved to lists"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Donors"
          value={totalDonations.toString()}
          icon={<Users className="h-5 w-5" />}
          description="Unique donors"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Raised"
          value={formatCurrency(totalRaised)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Selected scope"
          trend={{ value: 22, isPositive: true }}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Views to donations"
          trend={{ value: 0.5, isPositive: true }}
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interest Over Time</CardTitle>
            <CardDescription>Views and favourites trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFavourites" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
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
                  />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="favourites" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorFavourites)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Donation Performance</CardTitle>
            <CardDescription>Daily donation amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationTrendData}>
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
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              Smart Insights
            </CardTitle>
            <CardDescription>Recommendations based on current campaign performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 ${
                  insight.type === "warning"
                    ? "border-amber-500/20 bg-amber-500/10"
                    : insight.type === "success"
                      ? "border-azure-500/20 bg-azure-500/10"
                      : "border-primary/20 bg-primary/10"
                }`}
              >
                <div className="flex items-start gap-2">
                  {insight.type === "warning" ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  ) : insight.type === "success" ? (
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-azure-600" />
                  ) : (
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{insight.message}</p>
                    {insight.campaign && (
                      <Link
                        href={`/campaign/${insight.campaign.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View Campaign <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Comparison</CardTitle>
            <CardDescription>Performance metrics by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Favourites</TableHead>
                  <TableHead className="text-right">Donors</TableHead>
                  <TableHead className="text-right">Raised</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCampaigns.map((campaign) => {
                  const convRate = campaign.views > 0
                    ? ((campaign.donorCount / campaign.views) * 100).toFixed(2)
                    : "0.00"

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link href={`/campaign/${campaign.id}`} className="font-medium transition-colors hover:text-primary">
                          {campaign.title.length > 30 ? `${campaign.title.slice(0, 30)}...` : campaign.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{campaign.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.favouriteCount}</TableCell>
                      <TableCell className="text-right">{campaign.donorCount}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(campaign.raisedAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={parseFloat(convRate) > 2 ? "default" : "secondary"}>
                          {convRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Views vs Favourites</CardTitle>
            <CardDescription>Compare interest levels across the selected campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsVsFavouritesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="favourites" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardDescription>Raised amount split by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
