"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  BookOpen,
  Trash2,
  ArrowRight,
  HandHeart,
  X,
  SlidersHorizontal,
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
import { campaigns, categories } from "@/lib/mock-data"

// ── Data ─────────────────────────────────────────────────────────────────────

const fallbackDonorUser = {
  email: "donor@example.com",
  displayName: "David Chen",
  role: "donor",
}

const initialSaved = campaigns.filter(c => c.status === "active").slice(0, 6)

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n)
}

function daysLeft(endDate: string) {
  return Math.max(
    0,
    Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DonorFavouritesPage() {
  const [saved, setSaved] = useState(initialSaved)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("added")

  const filtered = useMemo(() => {
    return saved
      .filter(c => {
        const matchesSearch =
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.summary.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === "all" || c.category === category
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === "ending") return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        if (sortBy === "funded") return b.raisedAmount / b.targetAmount - a.raisedAmount / a.targetAmount
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })
  }, [saved, search, category, sortBy])

  const remove = (id: string) => setSaved(prev => prev.filter(c => c.id !== id))
  const hasFilters = search || category !== "all"

  return (
    <DashboardLayout
      role="donor"
      user={{ name: fallbackDonorUser.displayName, email: fallbackDonorUser.email, role: "Donor" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">My Saved Causes</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          {saved.length} campaign{saved.length !== 1 ? "s" : ""} saved — donate or remove any time.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved causes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="added">Recently Saved</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
            <SelectItem value="funded">Most Funded</SelectItem>
            <SelectItem value="newest">Newest Campaign</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setCategory("all") }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(campaign => {
            const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
            const remaining = daysLeft(campaign.endDate)

            return (
              <Card key={campaign.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {/* Cover image */}
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category pill on image */}
                  <div className="absolute bottom-3 left-3">
                    <Badge className="text-xs bg-black/60 text-white border-0 backdrop-blur-sm">
                      {campaign.category}
                    </Badge>
                  </div>
                  {/* Days left pill */}
                  {remaining <= 14 && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive" className="text-xs">
                        {remaining}d left
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="flex flex-col flex-1 p-4 gap-3">
                  {/* Title */}
                  <Link href={`/campaign/${campaign.id}`}>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
                      {campaign.title}
                    </h3>
                  </Link>

                  {/* Summary */}
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {campaign.summary}
                  </p>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-primary">{fmt(campaign.raisedAmount)}</span>
                      <span className="text-muted-foreground">{pct}% of {fmt(campaign.targetAmount)}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{remaining} days remaining</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link href={`/campaign/${campaign.id}`} className="flex-1">
                      <Button size="sm" className="w-full gap-1.5">
                        <HandHeart className="h-3.5 w-3.5" />
                        Donate
                      </Button>
                    </Link>
                    <Link href={`/campaign/${campaign.id}`}>
                      <Button variant="outline" size="sm" className="px-3">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-3 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from saved causes?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{campaign.title}&rdquo; will be removed from your saved list.
                            You can always save it again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(campaign.id)}>
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
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {hasFilters ? "No matching causes" : "No saved causes yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              {hasFilters
                ? "Try clearing your filters."
                : "Browse campaigns and tap the heart icon to save causes you care about."}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={() => { setSearch(""); setCategory("all") }}>
                <X className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            ) : (
              <Link href="/browse">
                <Button>Explore Campaigns</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
