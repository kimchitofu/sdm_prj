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
  MessageSquarePlus,
  Loader2,
  DollarSign,
  Mail,
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { useAuth } from "@/components/providers/session-provider"
import { categories } from "@/lib/mock-data"


type SortOption = "newest" | "ending-soon" | "most-viewed" | "highest-raised" | "most-favourited"

type CampaignStatus = "draft" | "active" | "completed" | "suspended" | "cancelled"

type CampaignDonorRow = {
  id: string
  name: string
  email: string | null
  totalDonated: number
  donationCount: number
  lastDonationAt: string
}

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
  donors?: CampaignDonorRow[]
}

type PageUser = {
  id: string
  firstName: string
  lastName: string
  email: string
}

type CampaignUpdateRow = {
  id: string
  title: string
  content: string
  createdAt: string
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format&fit=crop"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
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
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedCampaignForUpdate, setSelectedCampaignForUpdate] = useState<CampaignRow | null>(null)
  const [recentUpdates, setRecentUpdates] = useState<CampaignUpdateRow[]>([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false)
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateContent, setUpdateContent] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [donorDialogOpen, setDonorDialogOpen] = useState(false)
  const [selectedCampaignForDonors, setSelectedCampaignForDonors] = useState<CampaignRow | null>(null)

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

  const loadRecentUpdates = async (campaignId: string) => {
    try {
      setIsLoadingUpdates(true)
      setUpdateError(null)

      const response = await fetch(`/api/fund-raiser/campaign-updates?campaignId=${campaignId}`, {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load campaign updates.")
      }

      setRecentUpdates(Array.isArray(data?.updates) ? data.updates : [])
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Unable to load campaign updates.")
      setRecentUpdates([])
    } finally {
      setIsLoadingUpdates(false)
    }
  }

  const openUpdateDialog = async (campaign: CampaignRow) => {
    setSelectedCampaignForUpdate(campaign)
    setUpdateTitle("")
    setUpdateContent("")
    setUpdateSuccess(null)
    setUpdateError(null)
    setUpdateDialogOpen(true)
    await loadRecentUpdates(campaign.id)
  }

  const handleSubmitUpdate = async () => {
    if (!selectedCampaignForUpdate) return

    try {
      setIsSubmittingUpdate(true)
      setUpdateError(null)
      setUpdateSuccess(null)

      const response = await fetch("/api/fund-raiser/campaign-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          campaignId: selectedCampaignForUpdate.id,
          title: updateTitle,
          content: updateContent,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Unable to post campaign update.")
      }

      const workflow = data?.workflow
      let successMessage = "Campaign update posted successfully."

      if (workflow?.attempted && Number(workflow.deliveredCount || 0) > 0) {
        const deliveredCount = Number(workflow.deliveredCount || 0)
        successMessage = `Update posted successfully. Campaign update email sent to ${deliveredCount} supporter${deliveredCount === 1 ? "" : "s"}.`
      } else if (workflow?.attempted && Number(workflow.deliveredCount || 0) === 0) {
        successMessage = "Update posted successfully, but no supporters were eligible for email."
      } else if (workflow?.attempted === false && workflow?.reason) {
        successMessage = `Update posted successfully, but the workflow email did not send${workflow.reason ? `: ${workflow.reason}` : "."}`
      }

      setUpdateTitle("")
      setUpdateContent("")
      setUpdateSuccess(successMessage)
      setRecentUpdates(Array.isArray(data?.updates) ? data.updates : recentUpdates)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Unable to post campaign update.")
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const openDonorDialog = (campaign: CampaignRow) => {
    setSelectedCampaignForDonors(campaign)
    setDonorDialogOpen(true)
  }

  const selectedCampaignDonors = selectedCampaignForDonors?.donors ?? []
  const selectedCampaignDonorTotal = selectedCampaignDonors.reduce((sum, donor) => sum + donor.totalDonated, 0)
  const selectedCampaignDonationCount = selectedCampaignDonors.reduce((sum, donor) => sum + donor.donationCount, 0)

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
                    <DropdownMenuItem onClick={() => openUpdateDialog(campaign)}>
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      Post Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDonorDialog(campaign)}>
                      <Users className="mr-2 h-4 w-4" />
                      View Donors
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

      <Dialog
        open={updateDialogOpen}
        onOpenChange={(open) => {
          setUpdateDialogOpen(open)
          if (!open) {
            setSelectedCampaignForUpdate(null)
            setUpdateTitle("")
            setUpdateContent("")
            setUpdateError(null)
            setUpdateSuccess(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post campaign update</DialogTitle>
            <DialogDescription>
              Share a progress update with supporters for {selectedCampaignForUpdate?.title || "this campaign"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {updateError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {updateError}
              </div>
            ) : null}

            {updateSuccess ? (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {updateSuccess}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="campaign-update-title">Update title</Label>
              <Input
                id="campaign-update-title"
                value={updateTitle}
                onChange={(event) => setUpdateTitle(event.target.value)}
                placeholder="e.g. Emergency supplies have arrived"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-update-content">Update content</Label>
              <Textarea
                id="campaign-update-content"
                value={updateContent}
                onChange={(event) => setUpdateContent(event.target.value)}
                placeholder="Write a short progress update for your supporters..."
                rows={6}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSubmitUpdate}
                disabled={isSubmittingUpdate || !selectedCampaignForUpdate || !updateTitle.trim() || !updateContent.trim()}
              >
                {isSubmittingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
                {isSubmittingUpdate ? "Posting update..." : "Submit update"}
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Recent updates</h3>
                  <p className="text-sm text-muted-foreground">Latest updates posted for this campaign.</p>
                </div>
                {selectedCampaignForUpdate ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => loadRecentUpdates(selectedCampaignForUpdate.id)} disabled={isLoadingUpdates}>
                    {isLoadingUpdates ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                  </Button>
                ) : null}
              </div>

              {isLoadingUpdates ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading recent updates...</div>
              ) : recentUpdates.length > 0 ? (
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {recentUpdates.map((update) => (
                    <div key={update.id} className="rounded-md border bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{update.title}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{update.content}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(update.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No updates have been posted for this campaign yet.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={donorDialogOpen}
        onOpenChange={(open) => {
          setDonorDialogOpen(open)
          if (!open) {
            setSelectedCampaignForDonors(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Campaign donors</DialogTitle>
            <DialogDescription>
              Donor names, emails, and total donated for {selectedCampaignForDonors?.title || "this campaign"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Donors
                </div>
                <p className="text-2xl font-semibold text-foreground">{selectedCampaignDonors.length}</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total donated
                </div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(selectedCampaignDonorTotal)}</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  Donations
                </div>
                <p className="text-2xl font-semibold text-foreground">{selectedCampaignDonationCount}</p>
              </div>
            </div>

            {selectedCampaignDonors.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(220px,1fr)_130px_150px] gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                  <span>Donor</span>
                  <span>Email</span>
                  <span>Donations</span>
                  <span className="text-right">Amount</span>
                </div>

                <div className="max-h-[420px] divide-y overflow-y-auto">
                  {selectedCampaignDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="grid gap-2 px-3 py-3 md:grid-cols-[minmax(0,1.15fr)_minmax(220px,1fr)_130px_150px] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{donor.name}</p>
                        <p className="text-xs text-muted-foreground">Last donated {formatDateTime(donor.lastDonationAt)}</p>
                      </div>

                      <div className="min-w-0">
                        {donor.email ? (
                          <p className="flex min-w-0 items-center gap-2 truncate text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="truncate">{donor.email}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No email available</p>
                        )}
                      </div>

                      <div>
                        <Badge variant="secondary">
                          {donor.donationCount} {donor.donationCount === 1 ? "donation" : "donations"}
                        </Badge>
                      </div>

                      <p className="text-left font-semibold text-primary md:text-right">{formatCurrency(donor.totalDonated)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">No donors yet</h3>
                <p className="text-sm text-muted-foreground">Completed donations for this campaign will appear here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
