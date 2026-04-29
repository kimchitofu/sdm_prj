"use client"

import { useEffect, useState, useMemo } from "react"
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Search,
  ArrowUpDown,
  Eye,
  Calendar,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuth } from "@/components/providers/session-provider"

function formatCurrency(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

type CampaignMetric = {
  id: string
  title: string
  category: string
  status: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  views: number
  coverImage: string
  startDate: string
  endDate: string
  organiserName: string
  organiserEmail: string
  velocityPerDay: number
  recentDonationsCount: number
}

type DashboardData = {
  stats: {
    totalRaised: number
    activeCampaigns: number
    totalDonors: number
    todayVelocity: number
  }
  campaigns: CampaignMetric[]
}

type SortKey = 'fundingPct' | 'velocity' | 'raisedAmount' | 'donorCount' | 'recent'

export default function CampaignDashboardPage() {
  const { user: sessionUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("fundingPct")
  const [selected, setSelected] = useState<CampaignMetric | null>(null)

  useEffect(() => {
    fetch('/api/admin/campaign-dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.campaigns.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.organiserName.toLowerCase().includes(search.toLowerCase())
    )
    switch (sortBy) {
      case 'fundingPct':
        list = list.sort((a, b) => (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount))
        break
      case 'velocity':
        list = list.sort((a, b) => b.velocityPerDay - a.velocityPerDay)
        break
      case 'raisedAmount':
        list = list.sort((a, b) => b.raisedAmount - a.raisedAmount)
        break
      case 'donorCount':
        list = list.sort((a, b) => b.donorCount - a.donorCount)
        break
      case 'recent':
        list = list.sort((a, b) => b.recentDonationsCount - a.recentDonationsCount)
        break
    }
    return list
  }, [data, search, sortBy])

  const sidebarUser = sessionUser
    ? { name: `${sessionUser.firstName} ${sessionUser.lastName}`, email: sessionUser.email, role: sessionUser.role }
    : undefined

  return (
    <DashboardLayout role={(sessionUser?.role as import('@/lib/types').UserRole) ?? 'admin'} user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Campaign Funding Dashboard</h1>
        <p className="text-muted-foreground">Real-time visibility into all active campaigns, funding status, and donation velocity.</p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground">Loading campaign data...</div>
      ) : (
        <>
          {/* Platform Health Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Raised"
              value={formatCurrency(data?.stats.totalRaised ?? 0)}
              icon={<DollarSign className="h-5 w-5" />}
              description="Across all active campaigns"
            />
            <StatsCard
              title="Active Campaigns"
              value={(data?.stats.activeCampaigns ?? 0).toString()}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Currently fundraising"
            />
            <StatsCard
              title="Total Donors"
              value={(data?.stats.totalDonors ?? 0).toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              description="Across active campaigns"
            />
            <StatsCard
              title="Today's Velocity"
              value={formatCurrency(data?.stats.todayVelocity ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Donations received today"
            />
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by campaign, category, or organiser..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundingPct">Funding % (highest)</SelectItem>
                    <SelectItem value="velocity">Velocity ($/day)</SelectItem>
                    <SelectItem value="raisedAmount">Amount Raised</SelectItem>
                    <SelectItem value="donorCount">Donor Count</SelectItem>
                    <SelectItem value="recent">Recent Activity (7d)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                {filtered.length} campaign{filtered.length !== 1 ? 's' : ''} — velocity calculated over last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No active campaigns found</p>
                  <p className="text-sm mt-1">Approve campaigns in the Campaign Review section to see them here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Campaign</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="min-w-[180px]">Funding Progress</TableHead>
                      <TableHead>Donors</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Velocity (7d avg)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => {
                      const pct = c.targetAmount > 0 ? Math.min((c.raisedAmount / c.targetAmount) * 100, 100) : 0
                      return (
                        <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {c.coverImage && (
                                <img
                                  src={c.coverImage}
                                  alt=""
                                  className="h-10 w-10 rounded object-cover shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{c.title}</p>
                                <p className="text-xs text-muted-foreground">{c.organiserName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={pct} className="h-2 w-full" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatCurrency(c.raisedAmount)}</span>
                                <span className="font-medium">{pct.toFixed(1)}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">of {formatCurrency(c.targetAmount)}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{c.donorCount.toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.views.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(c.velocityPerDay)}/day
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.recentDonationsCount} donations (7d)</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelected(c)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>Funding metrics and organiser information</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.coverImage && (
                <img
                  src={selected.coverImage}
                  alt={selected.title}
                  className="w-full h-44 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-base">{selected.title}</h3>
                <Badge variant="secondary" className="mt-1">{selected.category}</Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">{formatCurrency(selected.targetAmount)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Raised</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selected.raisedAmount)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Organiser</p>
                    <p className="font-medium">{selected.organiserName}</p>
                    <p className="text-xs text-muted-foreground">{selected.organiserEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">7-Day Velocity</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selected.velocityPerDay)}/day</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium text-xs">{selected.startDate} → {selected.endDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-medium">{selected.views.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Funding Progress</p>
                <Progress
                  value={Math.min((selected.raisedAmount / selected.targetAmount) * 100, 100)}
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((selected.raisedAmount / selected.targetAmount) * 100).toFixed(1)}% of goal reached
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
