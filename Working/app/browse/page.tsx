'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Heart,
} from 'lucide-react'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { Footer } from '@/components/layout/footer'
import { CampaignCard } from '@/components/campaigns/campaign-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { categories } from '@/lib/mock-data'
import type { Campaign, CampaignStatus, ServiceType } from '@/lib/types'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_favourited', label: 'Most Favourited' },
  { value: 'highest_funded', label: 'Highest Funded' },
  { value: 'most_donors', label: 'Most Donors' },
]

const statusOptions: { value: CampaignStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'community', label: 'Community' },
  { value: 'environment', label: 'Environment' },
  { value: 'animals', label: 'Animals' },
  { value: 'creative', label: 'Creative' },
  { value: 'sports', label: 'Sports' },
  { value: 'memorial', label: 'Memorial' },
]

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialCategory = searchParams.get('category') || ''

  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>(['active'])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([])
  const [progressRange, setProgressRange] = useState([0, 100])
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favourites, setFavourites] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => setAllCampaigns(data.campaigns ?? []))
      .catch(() => {})
      .finally(() => setIsLoadingCampaigns(false))
  }, [])

  const filteredCampaigns = useMemo(() => {
    let result = [...allCampaigns]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.summary.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category))
    }

    // Filter by status — treat 'approved' same as 'active' for display
    if (selectedStatuses.length > 0) {
      result = result.filter((c) => {
        const normalised = c.status === 'approved' ? 'active' : c.status
        return selectedStatuses.includes(normalised as CampaignStatus)
      })
    }

    // Filter by service type
    if (selectedServiceTypes.length > 0) {
      result = result.filter((c) => selectedServiceTypes.includes(c.serviceType))
    }

    // Filter by progress range
    result = result.filter((c) => {
      const progress = Math.round((c.raisedAmount / c.targetAmount) * 100)
      return progress >= progressRange[0] && progress <= progressRange[1]
    })

    // Sort
    switch (sortBy) {
      case 'ending_soon':
        result.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        break
      case 'most_viewed':
        result.sort((a, b) => b.views - a.views)
        break
      case 'most_favourited':
        result.sort((a, b) => b.favouriteCount - a.favouriteCount)
        break
      case 'highest_funded':
        result.sort((a, b) => b.raisedAmount - a.raisedAmount)
        break
      case 'most_donors':
        result.sort((a, b) => b.donorCount - a.donorCount)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [allCampaigns, searchQuery, selectedCategories, selectedStatuses, selectedServiceTypes, progressRange, sortBy])

  const handleFavourite = (campaignId: string) => {
    setFavourites((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedStatuses(['active'])
    setSelectedServiceTypes([])
    setProgressRange([0, 100])
    router.push('/browse')
  }

  const activeFiltersCount =
    selectedCategories.length +
    (selectedStatuses.length !== 1 || selectedStatuses[0] !== 'active' ? selectedStatuses.length : 0) +
    selectedServiceTypes.length +
    (progressRange[0] !== 0 || progressRange[1] !== 100 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Categories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.name])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category.name))
                  }
                }}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm"
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground">{category.campaignCount}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Campaign Status</Label>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStatuses([...selectedStatuses, status.value])
                  } else {
                    setSelectedStatuses(selectedStatuses.filter((s) => s !== status.value))
                  }
                }}
              />
              <label
                htmlFor={`status-${status.value}`}
                className="cursor-pointer text-sm"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Service Type */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Service Type</Label>
        <div className="space-y-2">
          {serviceTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${type.value}`}
                checked={selectedServiceTypes.includes(type.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedServiceTypes([...selectedServiceTypes, type.value])
                  } else {
                    setSelectedServiceTypes(selectedServiceTypes.filter((t) => t !== type.value))
                  }
                }}
              />
              <label
                htmlFor={`service-${type.value}`}
                className="cursor-pointer text-sm"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Range */}
      <div>
        <Label className="mb-3 block text-sm font-medium">
          Funding Progress: {progressRange[0]}% - {progressRange[1]}%
        </Label>
        <Slider
          value={progressRange}
          onValueChange={setProgressRange}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Header */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h1 className="mb-2 text-3xl font-bold">Browse Campaigns</h1>
            <p className="text-muted-foreground">
              Discover causes that need your support and make a difference today.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search and Controls */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="relative">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort by
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-accent' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="hidden items-center rounded-md border sm:flex">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedServiceTypes.length > 0) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() =>
                    setSelectedCategories(selectedCategories.filter((c) => c !== category))
                  }
                >
                  {category}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {selectedServiceTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() =>
                    setSelectedServiceTypes(selectedServiceTypes.filter((t) => t !== type))
                  }
                >
                  {type}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Campaign Grid/List */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-muted-foreground">
                {isLoadingCampaigns ? 'Loading campaigns...' : `Showing ${filteredCampaigns.length} campaigns`}
              </div>

              {isLoadingCampaigns ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[380px] rounded-lg" />
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                  <Heart className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">No campaigns found</h3>
                  <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                    Try adjusting your search or filters to find campaigns that match your interests.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onFavourite={handleFavourite}
                      isFavourited={favourites.includes(campaign.id)}
                      showStatus
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      variant="horizontal"
                      onFavourite={handleFavourite}
                      isFavourited={favourites.includes(campaign.id)}
                      showStatus
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function BrowsePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-2 h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseContent />
    </Suspense>
  )
}
