"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  DollarSign,
  Search, 
  Calendar,
  Download,
  ExternalLink,
  TrendingUp,
  Award,
  Clock,
  Grid3X3,
  List,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { donations, campaigns, categories, users } from "@/lib/mock-data"

const doneeUser = users.find(u => u.role === 'donee') || users[0]

// Get donations for this donee
const doneeDonations = donations.slice(0, 15).map(d => ({
  ...d,
  campaign: campaigns.find(c => c.id === d.campaignId) || campaigns[0]
}))

// Calculate stats
const totalDonated = doneeDonations.reduce((sum, d) => sum + d.amount, 0)
const uniqueCampaigns = new Set(doneeDonations.map(d => d.campaignId)).size
const thisMonth = doneeDonations
  .filter(d => new Date(d.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .reduce((sum, d) => sum + d.amount, 0)

export default function DoneeDonationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filteredDonations = doneeDonations.filter(donation => {
    const matchesSearch = donation.campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || donation.campaign.category === categoryFilter
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const donationDate = new Date(donation.createdAt)
      const now = new Date()
      switch (dateFilter) {
        case "week":
          matchesDate = donationDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          matchesDate = donationDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "quarter":
          matchesDate = donationDate > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case "year":
          matchesDate = donationDate > new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate
  })

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "campaign":
        comparison = a.campaign.title.localeCompare(b.campaign.title)
        break
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <DashboardLayout 
      role="donee" 
      user={{
        name: doneeUser.displayName,
        email: doneeUser.email,
        avatar: doneeUser.avatar,
        role: 'Donee'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Donation History
          </h1>
          <p className="text-muted-foreground">
            Track your giving journey and impact across campaigns.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Donated"
          value={formatCurrency(totalDonated)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Lifetime giving"
        />
        <StatsCard
          title="Campaigns Supported"
          value={uniqueCampaigns.toString()}
          icon={<Award className="h-5 w-5" />}
          description="Unique campaigns"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(thisMonth)}
          icon={<Clock className="h-5 w-5" />}
          description="Last 30 days"
        />
        <StatsCard
          title="Total Donations"
          value={doneeDonations.length.toString()}
          icon={<TrendingUp className="h-5 w-5" />}
          description="All transactions"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by campaign name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("cards")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {sortedDonations.length > 0 ? (
        viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date <SortIcon field="date" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("campaign")}
                    >
                      <div className="flex items-center gap-1">
                        Campaign <SortIcon field="campaign" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount <SortIcon field="amount" />
                      </div>
                    </TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDonations.map((donation) => {
                    const progress = (donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100
                    
                    return (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">
                          {new Date(donation.createdAt).toLocaleDateString('en-AU')}
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/campaign/${donation.campaign.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {donation.campaign.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{donation.campaign.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatCurrency(donation.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/campaign/${donation.campaign.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDonations.map((donation) => {
              const progress = (donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100
              
              return (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{donation.campaign.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString('en-AU')}
                      </span>
                    </div>
                    <Link href={`/campaign/${donation.campaign.id}`}>
                      <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                        {donation.campaign.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(donation.amount)}
                      </span>
                      <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                        {donation.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Campaign Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link href={`/campaign/${donation.campaign.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Campaign
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No donations found
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters to find donations."
                : "You haven't made any donations yet. Start supporting causes you care about!"}
            </p>
            {(searchQuery || categoryFilter !== "all" || dateFilter !== "all") ? (
              <Button 
                variant="outline" 
                onClick={() => { 
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setDateFilter("all")
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link href="/browse">
                <Button>Browse Campaigns</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
