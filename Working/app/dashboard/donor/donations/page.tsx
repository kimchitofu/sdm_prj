"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  Receipt,
  ExternalLink,
  HandHeart,
  CircleDollarSign,
  CalendarDays,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
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
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { ReceiptDialog, buildReceiptNo, type ReceiptDonation } from "@/components/donor/receipt-dialog"
import { categories } from "@/lib/mock-data"
import { useCurrentUser } from "@/hooks/use-current-user"

// ── Types ────────────────────────────────────────────────────────────────────

interface DonationRow {
  id: string
  amount: number
  status: string
  createdAt: string
  campaignId: string
  campaign: {
    id: string
    title: string
    category: string
    raisedAmount: number
    targetAmount: number
  }
}

const fallbackDonorUser = {
  email: "donor@example.com",
  displayName: "David Chen",
  firstName: "David",
  lastName: "Chen",
  role: "donor",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n)
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Summary bar ──────────────────────────────────────────────────────────────

function SummaryBar({ rows }: { rows: DonationRow[] }) {
  const total = rows.reduce((s, d) => s + d.amount, 0)
  const campaignCount = new Set(rows.map(d => d.campaignId)).size
  const thisMonth = rows
    .filter(d => new Date(d.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((s, d) => s + d.amount, 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total Given", value: fmt(total), icon: CircleDollarSign, colour: "text-primary" },
        { label: "Campaigns", value: String(campaignCount), icon: Layers, colour: "text-blue-500" },
        { label: "This Month", value: fmt(thisMonth), icon: CalendarDays, colour: "text-green-600" },
        { label: "Receipts", value: String(rows.length), icon: Receipt, colour: "text-amber-500" },
      ].map(({ label, value, icon: Icon, colour }) => (
        <div key={label} className="rounded-xl border bg-card p-5">
          <Icon className={`h-5 w-5 mb-3 ${colour}`} />
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DonorDonationsPage() {
  const currentUser = useCurrentUser(fallbackDonorUser)
  const [allDonations, setAllDonations] = useState<DonationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [period, setPeriod] = useState("all")
  const [sortField, setSortField] = useState<"date" | "amount" | "campaign">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [openReceipt, setOpenReceipt] = useState<ReceiptDonation | null>(null)

  useEffect(() => {
    fetch("/api/donations")
      .then(r => r.json())
      .then(data => setAllDonations(data.donations ?? []))
      .catch(() => setAllDonations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return allDonations.filter(d => {
      if (search && !d.campaign.title.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== "all" && d.campaign.category !== category) return false
      if (period !== "all") {
        const ms: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365 }
        const cutoff = new Date(Date.now() - ms[period] * 24 * 60 * 60 * 1000)
        if (new Date(d.createdAt) < cutoff) return false
      }
      return true
    })
  }, [allDonations, search, category, period])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortField === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortField === "amount") cmp = a.amount - b.amount
      if (sortField === "campaign") cmp = a.campaign.title.localeCompare(b.campaign.title)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      {sortField === field
        ? sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  )

  const clearFilters = () => { setSearch(""); setCategory("all"); setPeriod("all") }
  const hasFilters = search || category !== "all" || period !== "all"

  return (
    <DashboardLayout
      role="donor"
      user={{
        name: currentUser.displayName,
        email: currentUser.email,
        role: "Donor",
      }}
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <HandHeart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Giving History</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-9">
          All your donations, receipts, and records in one place.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <SummaryBar rows={sorted} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns…"
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
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sort bar */}
          {sorted.length > 0 && (
            <div className="flex items-center gap-6 px-1 mb-3 text-xs text-muted-foreground">
              <span>{sorted.length} donation{sorted.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-xs">Sort:</span>
                <SortBtn field="date" label="Date" />
                <SortBtn field="amount" label="Amount" />
                <SortBtn field="campaign" label="Campaign" />
              </div>
            </div>
          )}

          {/* Donation list */}
          {sorted.length > 0 ? (
            <div className="space-y-3">
              {sorted.map(d => {
                const progress = Math.min(
                  100,
                  Math.round((d.campaign.raisedAmount / d.campaign.targetAmount) * 100)
                )
                const receiptDonation: ReceiptDonation = {
                  id: d.id,
                  amount: d.amount,
                  status: d.status,
                  createdAt: d.createdAt,
                  campaign: { id: d.campaign.id, title: d.campaign.title },
                }

                return (
                  <Card key={d.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Left: date column */}
                        <div className="flex flex-col items-center justify-center w-20 shrink-0 bg-muted/30 rounded-l-xl p-3 text-center">
                          <span className="text-xs text-muted-foreground font-medium uppercase leading-none">
                            {new Date(d.createdAt).toLocaleDateString("en-AU", { month: "short" })}
                          </span>
                          <span className="text-2xl font-bold text-foreground leading-tight">
                            {new Date(d.createdAt).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(d.createdAt).getFullYear()}
                          </span>
                        </div>

                        {/* Centre: campaign info */}
                        <div className="flex-1 min-w-0 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <Link
                                href={`/campaign/${d.campaign.id}`}
                                className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                              >
                                {d.campaign.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {d.campaign.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{shortDate(d.createdAt)}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-bold text-primary">{fmt(d.amount)}</p>
                              <Badge
                                variant={d.status === "completed" ? "default" : "secondary"}
                                className="text-xs mt-0.5"
                              >
                                {d.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Campaign progress */}
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {progress}% funded
                            </span>
                          </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex flex-col items-center justify-center gap-2 px-4 border-l">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-col h-auto py-2 px-3 gap-0.5 text-muted-foreground hover:text-foreground"
                            onClick={() => setOpenReceipt(receiptDonation)}
                            title={`Receipt ${buildReceiptNo(d.id)}`}
                          >
                            <Receipt className="h-4 w-4" />
                            <span className="text-xs">Receipt</span>
                          </Button>
                          <Link href={`/campaign/${d.campaign.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-col h-auto py-2 px-3 gap-0.5 text-muted-foreground hover:text-foreground"
                              title="View campaign"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-xs">Campaign</span>
                            </Button>
                          </Link>
                        </div>
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
                  <HandHeart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {hasFilters ? "No matching donations" : "No donations yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  {hasFilters
                    ? "Try clearing your filters to see all donations."
                    : "Your giving history will appear here once you've made a donation."}
                </p>
                {hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" /> Clear Filters
                  </Button>
                ) : (
                  <Link href="/browse">
                    <Button>Browse Campaigns</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Receipt dialog */}
      {openReceipt && (
        <ReceiptDialog
          donation={openReceipt}
          donorName={currentUser.displayName}
          onClose={() => setOpenReceipt(null)}
        />
      )}
    </DashboardLayout>
  )
}
