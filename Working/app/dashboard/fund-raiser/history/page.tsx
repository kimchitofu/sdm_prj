 "use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Search,
  Calendar,
  Download,
  Filter,
  Eye,
  Heart,
  Users,
  Clock,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card2, CardContent2 } from "@/components/ui/card2"
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
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { campaigns, users } from "@/lib/mock-data"

const fundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]

const completedCampaigns = campaigns
  .filter((c) => c.status === "completed")
  .concat(campaigns.slice(0, 5).map((c) => ({ ...c, status: "completed" as const, completedAt: "2024-01-15" })))

const availableServiceTypes = Array.from(
  new Set(completedCampaigns.map((campaign) => campaign.serviceType).filter(Boolean))
).sort()

const availableCategories = Array.from(
  new Set(completedCampaigns.map((campaign) => campaign.category).filter(Boolean))
).sort()

type SortField =
  | "title"
  | "category"
  | "period"
  | "goal"
  | "raised"
  | "progress"
  | "views"
  | "favourites"
  | "donors"

type SortDirection = "asc" | "desc"

export default function FundRaiserHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortField, setSortField] = useState<SortField>("period")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isExporting, setIsExporting] = useState(false)
  const tableExportRef = useRef<HTMLDivElement | null>(null)

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
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    categoryFilter !== "all" ||
    serviceTypeFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== ""

  const filteredCampaigns = useMemo(() => {
    const filtered = completedCampaigns.filter((campaign) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.summary.toLowerCase().includes(query)

      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
      const matchesServiceType = serviceTypeFilter === "all" || campaign.serviceType === serviceTypeFilter

      const completedDate = new Date(campaign.completedAt || campaign.endDate)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (toDate) {
        toDate.setHours(23, 59, 59, 999)
      }

      const matchesDateFrom = !fromDate || completedDate >= fromDate
      const matchesDateTo = !toDate || completedDate <= toDate

      return matchesSearch && matchesCategory && matchesServiceType && matchesDateFrom && matchesDateTo
    })

    const sorted = [...filtered].sort((a, b) => {
      const aProgress = a.targetAmount > 0 ? a.raisedAmount / a.targetAmount : 0
      const bProgress = b.targetAmount > 0 ? b.raisedAmount / b.targetAmount : 0
      const aCompleted = new Date(a.completedAt || a.endDate).getTime()
      const bCompleted = new Date(b.completedAt || b.endDate).getTime()
      const direction = sortDirection === "asc" ? 1 : -1

      switch (sortField) {
        case "title":
          return a.title.localeCompare(b.title) * direction
        case "category": {
          const categoryCompare = a.category.localeCompare(b.category)
          return (categoryCompare || a.serviceType.localeCompare(b.serviceType)) * direction
        }
        case "period":
          return (aCompleted - bCompleted) * direction
        case "goal":
          return (a.targetAmount - b.targetAmount) * direction
        case "raised":
          return (a.raisedAmount - b.raisedAmount) * direction
        case "progress":
          return (aProgress - bProgress) * direction
        case "views":
          return (a.views - b.views) * direction
        case "favourites":
          return (a.favouriteCount - b.favouriteCount) * direction
        case "donors":
          return (a.donorCount - b.donorCount) * direction
        default:
          return (aCompleted - bCompleted) * direction
      }
    })

    return sorted
  }, [searchQuery, categoryFilter, serviceTypeFilter, dateFrom, dateTo, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortField(field)
    setSortDirection(field === "title" || field === "category" ? "asc" : "desc")
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-foreground" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-foreground" />
    )
  }

  const handleExportReport = async () => {
    if (!tableExportRef.current || filteredCampaigns.length === 0 || typeof window === "undefined") return

    setIsExporting(true)
    try {
      const [{ toPng }, { PDFDocument }] = await Promise.all([
        import("html-to-image"),
        import("pdf-lib"),
      ])

      const exportNode = tableExportRef.current

      const dataUrl = await toPng(exportNode, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      })

      const pdf = await PDFDocument.create()
      const pngImage = await pdf.embedPng(dataUrl)

      const pageWidth = 841.89
      const pageHeight = 595.28
      const margin = 24
      const availableWidth = pageWidth - margin * 2
      const availableHeight = pageHeight - margin * 2

      const scale = availableWidth / pngImage.width
      const scaledWidth = availableWidth
      const scaledHeight = pngImage.height * scale

      let remainingHeight = scaledHeight
      let offsetY = 0

      while (remainingHeight > 0) {
        const page = pdf.addPage([pageWidth, pageHeight])
        page.drawImage(pngImage, {
          x: margin,
          y: pageHeight - margin - scaledHeight + offsetY,
          width: scaledWidth,
          height: scaledHeight,
        })

        remainingHeight -= availableHeight
        offsetY += availableHeight
      }

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "completed-campaign-history-report.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : "Unable to export report.")
    } finally {
      setIsExporting(false)
    }
  }

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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print-hide">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Completed Campaign History</h1>
          <p className="text-muted-foreground">
            Review your past fundraising activities and their outcomes.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport} disabled={isExporting || filteredCampaigns.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Preparing..." : "Export Report"}
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 xl:flex-row print-hide">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search completed campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:flex xl:flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full xl:w-[190px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map((category) => (
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
              {availableServiceTypes.map((serviceType) => (
                <SelectItem key={serviceType} value={serviceType}>
                  {serviceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full xl:w-[170px]">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-10"
              aria-label="Completed from date"
            />
          </div>

          <div className="relative w-full xl:w-[170px]">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-10"
              aria-label="Completed to date"
            />
          </div>

          <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters} className="w-full xl:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {filteredCampaigns.length > 0 ? (
        <div ref={tableExportRef}>
          <Card2 className="gap-0 overflow-hidden py-0">
            <CardContent2 className="p-0">
              <Table className="border-collapse bg-white">
                <TableHeader>
                  <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-12 pl-5">
                      <button type="button" onClick={() => toggleSort("title")} className="inline-flex items-center gap-1.5 font-medium">
                        Campaign
                        <SortIcon field="title" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort("category")} className="inline-flex items-center gap-1.5 font-medium">
                        Category / Service
                        <SortIcon field="category" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort("period")} className="inline-flex items-center gap-1.5 font-medium">
                        Period
                        <SortIcon field="period" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button type="button" onClick={() => toggleSort("goal")} className="ml-auto inline-flex items-center gap-1.5 font-medium">
                        Goal
                        <SortIcon field="goal" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button type="button" onClick={() => toggleSort("raised")} className="ml-auto inline-flex items-center gap-1.5 font-medium">
                        Raised
                        <SortIcon field="raised" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort("progress")} className="inline-flex items-center gap-1.5 font-medium">
                        Progress
                        <SortIcon field="progress" />
                      </button>
                    </TableHead>
                    <TableHead className="text-center">
                      <button type="button" onClick={() => toggleSort("views")} className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium">
                        Views
                        <SortIcon field="views" />
                      </button>
                    </TableHead>
                    <TableHead className="text-center">
                      <button type="button" onClick={() => toggleSort("favourites")} className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium">
                        Fav.
                        <SortIcon field="favourites" />
                      </button>
                    </TableHead>
                    <TableHead className="pr-5 text-center">
                      <button type="button" onClick={() => toggleSort("donors")} className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium">
                        Donors
                        <SortIcon field="donors" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
                    const completedOn = new Date(campaign.completedAt || campaign.endDate).toLocaleDateString()

                    return (
                      <TableRow
                        key={`${campaign.id}-${campaign.completedAt || campaign.endDate}`}
                        className="border-b border-border/60 hover:bg-muted/20"
                      >
                        <TableCell className="align-top py-4 pl-5">
                          <div className="space-y-1.5">
                            <Link
                              href={`/campaign/${campaign.id}`}
                              className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary"
                            >
                              {campaign.title}
                            </Link>
                            <div className="text-xs text-muted-foreground">Completed on {completedOn}</div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
                              {campaign.category}
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                              {campaign.serviceType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-sm text-muted-foreground">
                          <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                          <div>to {new Date(campaign.endDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-right font-medium">
                          {formatCurrency(campaign.targetAmount)}
                        </TableCell>
                        <TableCell className="align-top py-4 text-right font-semibold text-primary">
                          {formatCurrency(campaign.raisedAmount)}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="min-w-[120px] space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-2.5" />
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            {campaign.views.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground">
                            <Heart className="h-3.5 w-3.5" />
                            {campaign.favouriteCount}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 pr-5 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            {campaign.donorCount}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent2>
          </Card2>
        </div>
      ) : (
        <Card2 className="gap-0 py-0 overflow-hidden">
          <CardContent2 className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No completed campaigns found</h3>
            <p className="mx-auto mb-4 max-w-md text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters to find matching campaigns."
                : "Your completed campaigns will appear here once they end."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            ) : null}
          </CardContent2>
        </Card2>
      )}
    </DashboardLayout>
  )
}
