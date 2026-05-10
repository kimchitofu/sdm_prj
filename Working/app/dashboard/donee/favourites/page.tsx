"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Heart, 
  Search, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Trash2,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { campaigns, categories, users } from "@/lib/mock-data"

const doneeUser = users.find(u => u.role === 'donee') || users[0]

// Simulate favourited campaigns
const favouritedCampaignIds = campaigns.slice(0, 6).map(c => c.id)
const favouritedCampaigns = campaigns.filter(c => favouritedCampaignIds.includes(c.id))

export default function DoneeFavouritesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date_added")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favourites, setFavourites] = useState(favouritedCampaigns)

  const filteredCampaigns = favourites.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'ending_soon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      case 'most_funded':
        return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const removeFavourite = (campaignId: string) => {
    setFavourites(favourites.filter(c => c.id !== campaignId))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          My Favourites
        </h1>
        <p className="text-muted-foreground">
          Campaigns you&apos;ve saved for later. {favourites.length} campaign{favourites.length !== 1 ? 's' : ''} saved.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favourites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_added">Date Added</SelectItem>
              <SelectItem value="ending_soon">Ending Soon</SelectItem>
              <SelectItem value="most_funded">Most Funded</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {sortedCampaigns.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCampaigns.map((campaign) => {
              const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
              const daysRemaining = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              
              return (
                <Card key={campaign.id} className="overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img 
                      src={campaign.coverImage} 
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant="secondary">{campaign.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/campaign/${campaign.id}`}>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {campaign.summary}
                    </p>
                    <div className="space-y-3">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)}</span>
                        <span className="text-muted-foreground">{daysRemaining} days left</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/campaign/${campaign.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          Donate Now
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from favourites?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove &ldquo;{campaign.title}&rdquo; from your saved campaigns.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeFavourite(campaign.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCampaigns.map((campaign) => {
              const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
              const daysRemaining = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              
              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-48 aspect-video md:aspect-square bg-muted shrink-0">
                        <img 
                          src={campaign.coverImage} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary">{campaign.category}</Badge>
                              <Badge variant="outline">{campaign.serviceType}</Badge>
                            </div>
                            <Link href={`/campaign/${campaign.id}`}>
                              <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                                {campaign.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {campaign.summary}
                            </p>
                            <div className="space-y-2">
                              <Progress value={progress} className="h-2" />
                              <div className="flex gap-4 text-sm">
                                <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)} raised</span>
                                <span className="text-muted-foreground">{Math.round(progress)}% of {formatCurrency(campaign.targetAmount)}</span>
                                <span className="text-muted-foreground">{daysRemaining} days left</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link href={`/campaign/${campaign.id}`}>
                              <Button size="sm">
                                Donate
                              </Button>
                            </Link>
                            <Link href={`/campaign/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove from favourites?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove &ldquo;{campaign.title}&rdquo; from your saved campaigns.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeFavourite(campaign.id)}>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
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
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || categoryFilter !== "all" ? "No matching favourites" : "No favourites yet"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "all" 
                ? "Try adjusting your search or filters to find campaigns."
                : "Start browsing campaigns and save the ones you'd like to support later."}
            </p>
            {(searchQuery || categoryFilter !== "all") ? (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setCategoryFilter("all") }}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Link href="/browse">
                <Button>
                  Browse Campaigns
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
