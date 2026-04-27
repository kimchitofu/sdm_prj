"use client"

import { useEffect, useMemo, useState } from "react"
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
}

type SortOption = "newest" | "ending-soon" | "most-viewed" | "highest-raised" | "most-favourited"

type CampaignStatus = "draft" | "active" | "completed" | "suspended" | "cancelled"

type CampaignRow = {
  id: string
  title: string
  summary: string
  category: string
  serviceType: string
  status: CampaignStatus
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

type PageUser = {
  id: string
  firstName: string
  lastName: string
  email: string
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format&fit=crop"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatServiceType(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getStatusVariant(status: CampaignStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default"
    case "draft":
      return "secondary"
    case "suspended":
    case "cancelled":
      return "destructive"
    case "completed":
    default:
      return "outline"
  }
}

export default function ManageCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [currentUser, setCurrentUser] = useState<PageUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: sessionUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCampaigns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/fund-raiser/campaigns", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load campaigns.")
        }

        if (!isMounted) return

        setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : [])
        setCurrentUser(data?.user ?? null)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Unable to load campaigns.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCampaigns()

    return () => {
      isMounted = false
    }
  }, [])

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setServiceTypeFilter("all")
    setSortBy("newest")
  }

  const categories = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.category))).sort((a, b) => a.localeCompare(b)),
    [campaigns]
  )

  const serviceTypes = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.serviceType))).sort((a, b) => a.localeCompare(b)),
    [campaigns]
  )

  const hasActiveFilters =
    searchQuery.trim().length > 0 || categoryFilter !== "all" || serviceTypeFilter !== "all" || sortBy !== "newest"

  const getSortedCampaigns = (campaignList: CampaignRow[]) => {
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

  const allCampaigns = useMemo(() => campaigns, [campaigns])
  const draftCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.status === "draft"), [campaigns])
  const activeCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.status === "active"), [campaigns])
  const completedCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.status === "completed"), [campaigns])

  const filteredAllCampaigns = useMemo(
    () => getSortedCampaigns(allCampaigns),
    [allCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy]
  )
  const filteredDraftCampaigns = useMemo(
    () => getSortedCampaigns(draftCampaigns),
    [draftCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy]
  )
  const filteredActiveCampaigns = useMemo(
    () => getSortedCampaigns(activeCampaigns),
    [activeCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy]
  )
  const filteredCompletedCampaigns = useMemo(
    () => getSortedCampaigns(completedCampaigns),
    [completedCampaigns, searchQuery, categoryFilter, serviceTypeFilter, sortBy]
  )

  const handleDelete = async () => {
    if (!selectedCampaign) return

    try {
      setIsDeleting(true)
      const response = await fetch("/api/fund-raiser/campaigns", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ campaignId: selectedCampaign }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Unable to delete campaign.")
      }

      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== selectedCampaign))
      setDeleteDialogOpen(false)
      setSelectedCampaign(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete campaign.")
    } finally {
      setIsDeleting(false)
    }
  }

  const CampaignCard = ({ campaign }: { campaign: CampaignRow }) => {
    const progress = campaign.targetAmount > 0 ? (campaign.raisedAmount / campaign.targetAmount) * 100 : 0
    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    return (
      <Card2 className="overflow-hidden">
        <CardContent2 className="p-0">
          <div className="grid md:grid-cols-[220px_minmax(0,1fr)] md:items-stretch">
            <div className="relative min-h-[168px] overflow-hidden bg-muted md:min-h-full">
              <img
                src={campaign.coverImage || FALLBACK_IMAGE}
                alt={campaign.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <Badge
                className={`absolute left-2 top-2 ${campaign.status === "completed" ? "border-border bg-white text-foreground" : ""}`}
                variant={getStatusVariant(campaign.status)}
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
                      {formatServiceType(campaign.serviceType)}
                    </Badge>
                  </div>
                  <Link href={`/campaign/${campaign.id}`}>
                    <h3 className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary">
                      {campaign.title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{campaign.summary}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                    {campaign.status === "active" && <span>{daysRemaining} days left</span>}
                  </div>

                  <div className="mt-2.5">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)}</span>
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% of {formatCurrency(campaign.targetAmount)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
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
                    <DropdownMenuItem disabled>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
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

  const dashboardUser = {
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Fund Raiser",
    email: currentUser?.email ?? "",
    role: "Fund Raiser",
  }

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

      {error ? (
        <Card2 className="mb-6 border-destructive/30">
          <CardContent2 className="py-4 text-sm text-destructive">{error}</CardContent2>
        </Card2>
      ) : null}

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
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
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
                  {formatServiceType(serviceType)}
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

      {isLoading ? (
        <Card2>
          <CardContent2 className="py-16 text-center text-muted-foreground">Loading campaigns...</CardContent2>
        </Card2>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({allCampaigns.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({draftCampaigns.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeCampaigns.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCampaigns.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredAllCampaigns.length > 0 ? (
              <div className="space-y-4">
                {filteredAllCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <EmptyState status={campaigns.length === 0 ? "all" : "matching"} />
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
        </Tabs>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
