"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Heart,
  Users,
  Filter,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card2, CardContent2 } from "@/components/ui/card2"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { useAuth } from "@/components/providers/session-provider"
import { categories } from "@/lib/mock-data"

type DbCampaign = {
  id: string
  title: string
  summary: string
  category: string
  serviceType: string
  status: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  views: number
  favouriteCount: number
  startDate: string
  endDate: string
  coverImage: string
  createdAt: string
}

type SortOption = "newest" | "ending-soon" | "most-viewed" | "highest-raised" | "most-favourited"

export default function ManageCampaignsPage() {
  const { user: sessionUser } = useAuth()
  const [allCampaigns, setAllCampaigns] = useState<DbCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/fund-raiser/campaigns')
      .then((r) => r.json())
      .then((data) => setAllCampaigns(data.campaigns ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setServiceTypeFilter("all")
    setSortBy("newest")
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 || categoryFilter !== "all" || serviceTypeFilter !== "all" || sortBy !== "newest"

  const getSortedCampaigns = (campaignList: DbCampaign[]) => {
    const filtered = campaignList.filter((campaign) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.summary.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
      const matchesServiceType = serviceTypeFilter === "all" || campaign.serviceType === serviceTypeFilter
      return matchesSearch && matchesCategory && matchesServiceType
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "ending-soon": {
          const aTime = new Date(a.endDate).getTime()
          const bTime = new Date(b.endDate).getTime()
          return aTime - bTime
        }
        case "most-viewed":
          return b.views - a.views
        case "highest-raised":
          return b.raisedAmount - a.raisedAmount
        case "most-favourited":
          return b.favouriteCount - a.favouriteCount
        case "newest":
        default: {
          const aTime = new Date(a.createdAt).getTime()
          const bTime = new Date(b.createdAt).getTime()
          return bTime - aTime
        }
      }
    })
  }

  const filteredAllCampaigns = useMemo(() => getSortedCampaigns(allCampaigns), [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy])
  const filteredDraftCampaigns = useMemo(() => getSortedCampaigns(allCampaigns.filter(c => c.status === 'draft')), [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy])
  const filteredActiveCampaigns = useMemo(() => getSortedCampaigns(allCampaigns.filter(c => c.status === 'active')), [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy])
  const filteredPendingCampaigns = useMemo(() => getSortedCampaigns(allCampaigns.filter(c => c.status === 'pending_review')), [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy])
  const filteredCompletedCampaigns = useMemo(() => getSortedCampaigns(allCampaigns.filter(c => c.status === 'completed')), [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy])

  const CampaignCard = ({ campaign }: { campaign: DbCampaign }) => {
    const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    return (
      <Card2 className="overflow-hidden">
        <CardContent2 className="p-0">
          <div className="grid md:grid-cols-[220px_minmax(0,1fr)] md:items-stretch">
            <div className="relative min-h-[168px] overflow-hidden bg-muted md:min-h-full">
              <img src={campaign.coverImage} alt={campaign.title} className="absolute inset-0 h-full w-full object-cover" />
              <Badge
                className={`absolute left-2 top-2 ${
                  campaign.status === "completed" ? "border-border bg-white text-foreground" : ""
                }`}
                variant={
                  campaign.status === "active"
                    ? "default"
                    : campaign.status === "draft"
                      ? "secondary"
                      : "outline"
                }
              >
                {campaign.status}
              </Badge>
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {campaign.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {campaign.serviceType}
                    </Badge>
                  </div>
                  <Link href={`/campaign/${campaign.id}`}>
                    <h3 className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary">
                      {campaign.title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{campaign.summary}</p>

                  <div className="mt-2.5 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {campaign.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {campaign.favouriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.donorCount}
                    </span>
                    {campaign.status === "active" && (
                      <span className="text-muted-foreground">{daysRemaining} days left</span>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)}</span>
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% of {formatCurrency(campaign.targetAmount)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/campaign/${campaign.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Public Page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/fund-raiser/campaigns/${campaign.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Campaign
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedCampaign(campaign.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent2>
      </Card2>
    )
  }

  const EmptyState = ({ status }: { status: string }) => (
    <Card2>
      <CardContent2 className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {status === "matching" ? "No campaigns match your current filters" : `No ${status} campaigns`}
        </h3>
        <p className="mx-auto mb-4 max-w-md text-muted-foreground">
          {status === "draft"
            ? "Start creating a new campaign and save it as a draft."
            : status === "active"
              ? "Publish a draft campaign to start receiving donations."
              : status === "completed"
                ? "Completed campaigns will appear here after they end."
                : "Try adjusting or resetting your search and filters to find more campaigns."}
        </p>
        {status === "matching" ? (
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset filters
          </Button>
        ) : status !== "completed" ? (
          <Link href="/dashboard/fund-raiser/campaigns/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        ) : null}
      </CardContent2>
    </Card2>
  )

  return (
    <DashboardLayout
      role="fund_raiser"
      user={sessionUser ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email,
        role: 'fund_raiser',
      } : undefined}
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">My Campaigns</h1>
          <p className="text-muted-foreground">Manage and monitor all your fundraising activities.</p>
        </div>
        <Link href="/dashboard/fund-raiser/campaigns/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 xl:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:flex">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full xl:w-[190px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
            <SelectTrigger className="w-full xl:w-[190px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Types</SelectItem>
              {Array.from(new Set(allCampaigns.map((c) => c.serviceType))).sort().map((serviceType) => (
                <SelectItem key={serviceType} value={serviceType}>
                  {serviceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full xl:w-[190px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
              <SelectItem value="highest-raised">Highest Raised</SelectItem>
              <SelectItem value="most-favourited">Most Favourited</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters} className="w-full xl:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-muted-foreground">Loading campaigns...</div>
      )}

      {!isLoading && <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({allCampaigns.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Review ({filteredPendingCampaigns.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({filteredDraftCampaigns.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredActiveCampaigns.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filteredCompletedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredAllCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredAllCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState status="matching" />
          )}
        </TabsContent>

        <TabsContent value="draft">
          {filteredDraftCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredDraftCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState status="draft" />
          )}
        </TabsContent>

        <TabsContent value="active">
          {filteredActiveCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredActiveCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState status="active" />
          )}
        </TabsContent>

        <TabsContent value="pending">
          {filteredPendingCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredPendingCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState status="pending_review" />
          )}
        </TabsContent>

        <TabsContent value="completed">
          {filteredCompletedCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredCompletedCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState status="completed" />
          )}
        </TabsContent>
      </Tabs>}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setSelectedCampaign(null)
                setDeleteDialogOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
