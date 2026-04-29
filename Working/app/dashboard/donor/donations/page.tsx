"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Search,
  Calendar,
  ExternalLink,
  TrendingUp,
  Award,
  Clock,
  Grid3X3,
  List,
  Filter,
  ChevronDown,
  ChevronUp,
  Receipt,
  Download,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Printer,
  Link2,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { donations, campaigns, categories, users } from "@/lib/mock-data"
import { toast } from "sonner"

const donorUser = users.find(u => u.role === 'donor') || users.find(u => u.role === 'donee') || users[0]

const donorDonations = donations.slice(0, 15).map(d => ({
  ...d,
  campaign: campaigns.find(c => c.id === d.campaignId) || campaigns[0],
}))

const totalDonated = donorDonations.reduce((sum, d) => sum + d.amount, 0)
const uniqueCampaigns = new Set(donorDonations.map(d => d.campaignId)).size
const thisMonth = donorDonations
  .filter(d => new Date(d.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .reduce((sum, d) => sum + d.amount, 0)

type DonationWithCampaign = (typeof donorDonations)[number]

function buildReceiptNo(id: string) {
  return `DON-${id.slice(-6).toUpperCase()}`
}

// ─── Receipt Dialog ────────────────────────────────────────────────────────────

function ReceiptDialog({
  donation,
  donorName,
  onClose,
}: {
  donation: DonationWithCampaign
  donorName: string
  onClose: () => void
}) {
  const [emailTo, setEmailTo] = useState("")
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [emailError, setEmailError] = useState("")
  const [activePanel, setActivePanel] = useState<"none" | "email" | "share">("none")
  const [linkCopied, setLinkCopied] = useState(false)

  const receiptNo = buildReceiptNo(donation.id)
  const donationDate = new Date(donation.createdAt).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(donation.amount)

  const receiptUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/receipt/${donation.id}`
      : `/receipt/${donation.id}`

  const togglePanel = (panel: "email" | "share") => {
    setActivePanel(prev => (prev === panel ? "none" : panel))
    if (panel === "email") {
      setEmailStatus("idle")
      setEmailError("")
      setEmailTo("")
    }
    if (panel === "share") {
      setLinkCopied(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=700,height=900")
    if (!printWindow) {
      toast.error("Pop-up blocked", {
        description: "Allow pop-ups for this site to download the receipt.",
      })
      return
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${receiptNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f3f4f6; display: flex; justify-content: center; padding: 40px 16px; }
    .card { background: #fff; border-radius: 12px; max-width: 520px; width: 100%; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.12); }
    .header { background: #4f46e5; padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin-bottom: 4px; }
    .header p { color: #c7d2fe; font-size: 14px; }
    .body { padding: 32px; }
    .thank-you { font-size: 16px; margin-bottom: 24px; color: #374151; }
    .receipt-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; color: #111827; text-align: right; max-width: 60%; }
    .amount-row { padding-top: 16px; margin-top: 8px; border-top: 2px solid #e5e7eb; }
    .amount-value { font-size: 24px; color: #4f46e5; }
    .status { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .footer { margin-top: 24px; font-size: 13px; color: #9ca3af; line-height: 1.6; }
    @media print { body { background: #fff; padding: 0; } .card { box-shadow: none; border-radius: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>FundBridge</h1>
      <p>Official Donation Receipt</p>
    </div>
    <div class="body">
      <p class="thank-you">Thank you for your generous donation, <strong>${donorName}</strong>!</p>
      <div class="receipt-box">
        <div class="row"><span class="label">Receipt No</span><span class="value">${receiptNo}</span></div>
        <div class="row"><span class="label">Donation ID</span><span class="value" style="font-family:monospace;font-size:12px;">${donation.id}</span></div>
        <div class="row"><span class="label">Campaign</span><span class="value">${donation.campaign.title}</span></div>
        <div class="row"><span class="label">Donor</span><span class="value">${donorName}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${donationDate}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="status">Completed</span></span></div>
        <div class="row amount-row"><span class="label" style="font-size:15px;">Amount Donated</span><span class="value amount-value">${formattedAmount}</span></div>
      </div>
      <p class="footer">This receipt is issued as official confirmation of your donation to FundBridge.<br/>Please retain it for your personal records.</p>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`)
    printWindow.document.close()
  }

  const handleCopyLink = async () => {
    // Use native share sheet on mobile if available
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Donation Receipt — ${receiptNo}`,
          text: `FundBridge receipt for a donation to ${donation.campaign.title} (${formattedAmount})`,
          url: receiptUrl,
        })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(receiptUrl)
      setLinkCopied(true)
      toast.success("Link copied!", {
        description: "Share this link so anyone can view the receipt.",
      })
      setTimeout(() => setLinkCopied(false), 3000)
    } catch {
      toast.error("Could not copy", {
        description: "Please copy the link below manually.",
      })
    }
  }

  const handleSendEmail = async () => {
    if (!emailTo || !/\S+@\S+\.\S+/.test(emailTo)) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setEmailStatus("sending")
    setEmailError("")

    try {
      const res = await fetch("/api/receipt/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          receiptNo,
          campaignTitle: donation.campaign.title,
          amount: donation.amount,
          donorName,
          donationDate,
          donationId: donation.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setEmailStatus("error")
        setEmailError(data.error || "Failed to send email. Please try again.")
      } else {
        setEmailStatus("sent")
        toast.success("Receipt sent!", {
          description: `A copy has been delivered to ${emailTo}.`,
        })
      }
    } catch {
      setEmailStatus("error")
      setEmailError("Network error. Please check your connection and try again.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Donation Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt details */}
          <div className="rounded-lg border bg-muted/30 p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt No</span>
              <span className="font-semibold">{receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donation ID</span>
              <span className="font-mono text-xs">{donation.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign</span>
              <span className="font-medium text-right max-w-[60%]">{donation.campaign.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donor</span>
              <span className="font-medium">{donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{donationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Amount Donated</span>
              <span className="text-2xl font-bold text-primary">{formattedAmount}</span>
            </div>
          </div>

          {/* Three action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handlePrint} variant="outline" className="flex-col h-auto py-3 gap-1">
              <Printer className="h-4 w-4" />
              <span className="text-xs">Download</span>
            </Button>
            <Button
              onClick={() => togglePanel("share")}
              variant={activePanel === "share" ? "secondary" : "outline"}
              className="flex-col h-auto py-3 gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
            <Button
              onClick={() => togglePanel("email")}
              variant={activePanel === "email" ? "secondary" : "outline"}
              className="flex-col h-auto py-3 gap-1"
            >
              <Mail className="h-4 w-4" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          {/* Share panel */}
          {activePanel === "share" && (
            <div className="rounded-lg border p-4 space-y-3 bg-background">
              <p className="text-sm font-medium">Share this receipt</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={receiptUrl}
                  className="font-mono text-xs text-muted-foreground"
                  onFocus={e => e.target.select()}
                />
                <Button
                  size="sm"
                  variant={linkCopied ? "default" : "outline"}
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  <span className="ml-2">{linkCopied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the receipt page.
              </p>
            </div>
          )}

          {/* Email panel */}
          {activePanel === "email" && (
            <div className="rounded-lg border p-4 space-y-3 bg-background">
              <p className="text-sm font-medium">Email this receipt</p>

              {emailStatus === "sent" ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Receipt delivered to {emailTo}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="receipt-email" className="text-sm">
                      Recipient email
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="receipt-email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={emailTo}
                        onChange={e => {
                          setEmailTo(e.target.value)
                          setEmailError("")
                        }}
                        className={emailError ? "border-destructive" : ""}
                        disabled={emailStatus === "sending"}
                        onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      />
                      <Button
                        onClick={handleSendEmail}
                        disabled={emailStatus === "sending"}
                        size="sm"
                        className="shrink-0"
                      >
                        {emailStatus === "sending" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="ml-2">
                          {emailStatus === "sending" ? "Sending…" : "Send"}
                        </span>
                      </Button>
                    </div>
                    {(emailError || emailStatus === "error") && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {emailError || "Failed to send. Please try again."}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A formatted receipt will be delivered to the address above.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DonorDonationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [receiptDonation, setReceiptDonation] = useState<DonationWithCampaign | null>(null)

  const filteredDonations = donorDonations.filter(donation => {
    const matchesSearch = donation.campaign.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || donation.campaign.category === categoryFilter

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <DashboardLayout
      role="donor"
      user={{
        name: donorUser.displayName,
        email: donorUser.email,
        avatar: donorUser.avatar,
        role: "Donor",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Donation History
          </h1>
          <p className="text-muted-foreground">
            Track your giving journey, view receipts, and manage your records.
          </p>
        </div>
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
          value={donorDonations.length.toString()}
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
                placeholder="Search by campaign name…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
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
                  {sortedDonations.map(donation => {
                    const progress =
                      (donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100

                    return (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">
                          {new Date(donation.createdAt).toLocaleDateString("en-AU")}
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
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              donation.status === "completed" ? "default" : "secondary"
                            }
                          >
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReceiptDonation(donation)}
                              title="View Receipt"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                            <Link href={`/campaign/${donation.campaign.id}`}>
                              <Button variant="ghost" size="sm" title="View Campaign">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
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
            {sortedDonations.map(donation => {
              const progress =
                (donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100

              return (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{donation.campaign.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString("en-AU")}
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
                      <Badge
                        variant={donation.status === "completed" ? "default" : "secondary"}
                      >
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
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setReceiptDonation(donation)}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                      <Link href={`/campaign/${donation.campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Campaign
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
            <h3 className="text-lg font-semibold text-foreground mb-2">No donations found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters to find donations."
                : "You haven't made any donations yet. Start supporting causes you care about!"}
            </p>
            {searchQuery || categoryFilter !== "all" || dateFilter !== "all" ? (
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

      {/* Receipt Dialog */}
      {receiptDonation && (
        <ReceiptDialog
          donation={receiptDonation}
          donorName={donorUser.displayName}
          onClose={() => setReceiptDonation(null)}
        />
      )}
    </DashboardLayout>
  )
}
