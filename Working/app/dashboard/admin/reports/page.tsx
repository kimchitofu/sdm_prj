"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  Flag,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import {
  users,
  campaigns,
  donations,
  campaignReports,
  messageReports,
  platformStats,
  reportSummary,
  formatCurrency,
} from "@/lib/mock-data"

const adminUser = {
  displayName: 'Super Admin',
  email: 'admin@gmail.com',
}

type ReportType = 'users' | 'campaigns' | 'donations' | 'platform' | 'reports'

interface ReportConfig {
  id: ReportType
  title: string
  description: string
  icon: React.ReactNode
  rowCount: number
  color: string
}

const reportTypes: ReportConfig[] = [
  {
    id: 'platform',
    title: 'Platform Summary',
    description: 'Overall platform statistics, KPIs, and top-level metrics.',
    icon: <BarChart3 className="h-6 w-6" />,
    rowCount: 1,
    color: 'text-blue-500',
  },
  {
    id: 'users',
    title: 'User Report',
    description: 'All registered users with roles, status, and join dates.',
    icon: <Users className="h-6 w-6" />,
    rowCount: users.length,
    color: 'text-purple-500',
  },
  {
    id: 'campaigns',
    title: 'Campaign Report',
    description: 'All campaigns with status, raised amounts, and donor counts.',
    icon: <FileText className="h-6 w-6" />,
    rowCount: campaigns.length,
    color: 'text-green-500',
  },
  {
    id: 'donations',
    title: 'Donation Report',
    description: 'All donation transactions with amounts and donor information.',
    icon: <DollarSign className="h-6 w-6" />,
    rowCount: donations.length,
    color: 'text-amber-500',
  },
  {
    id: 'reports',
    title: 'Flagged Content Report',
    description: 'All reported campaigns and messages with resolution status.',
    icon: <Flag className="h-6 w-6" />,
    rowCount: campaignReports.length + messageReports.length,
    color: 'text-red-500',
  },
]

// CSV export helpers
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csv = [headers, ...rows].map(row => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportReport(type: ReportType, startDate: string, endDate: string) {
  const dateRange = `_${startDate || 'all'}_to_${endDate || 'all'}`
  const filterByDate = <T extends { createdAt: string }>(arr: T[]) =>
    arr.filter(r => {
      const d = r.createdAt
      return (!startDate || d >= startDate) && (!endDate || d <= endDate + 'T23:59:59Z')
    })

  switch (type) {
    case 'platform': {
      const rows = [
        ['Total Users', platformStats.totalUsers],
        ['Active Users', platformStats.activeUsers],
        ['Suspended Users', platformStats.suspendedUsers],
        ['Total Fund Raisers', platformStats.totalFundRaisers],
        ['Total Donees', platformStats.totalDonees],
        ['Total Campaigns', platformStats.totalCampaigns],
        ['Active Campaigns', platformStats.activeCampaigns],
        ['Completed Campaigns', platformStats.completedCampaigns],
        ['Total Donations', platformStats.totalDonations],
        ['Total Donation Amount ($)', platformStats.totalDonationAmount],
        ['Average Donation ($)', platformStats.averageDonation],
      ]
      downloadCSV(`platform_summary${dateRange}.csv`, ['Metric', 'Value'], rows)
      break
    }
    case 'users': {
      const filtered = filterByDate(users)
      const rows = filtered.map(u => [
        u.id, u.displayName, u.email, u.role, u.status,
        u.isVerified ? 'Yes' : 'No',
        u.location || '',
        new Date(u.createdAt).toLocaleDateString(),
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '',
      ])
      downloadCSV(`users_report${dateRange}.csv`,
        ['ID', 'Name', 'Email', 'Role', 'Status', 'Verified', 'Location', 'Joined', 'Last Login'],
        rows)
      break
    }
    case 'campaigns': {
      const filtered = filterByDate(campaigns)
      const rows = filtered.map(c => [
        c.id, c.title, c.category, c.serviceType, c.status,
        c.targetAmount, c.raisedAmount, c.donorCount, c.views,
        c.organiser.name,
        new Date(c.createdAt).toLocaleDateString(),
        c.endDate ? new Date(c.endDate).toLocaleDateString() : '',
        c.location || '',
      ])
      downloadCSV(`campaigns_report${dateRange}.csv`,
        ['ID', 'Title', 'Category', 'Service Type', 'Status', 'Target ($)', 'Raised ($)', 'Donors', 'Views', 'Organiser', 'Created', 'End Date', 'Location'],
        rows)
      break
    }
    case 'donations': {
      const filtered = filterByDate(donations)
      const rows = filtered.map(d => [
        d.id, d.isAnonymous ? 'Anonymous' : d.donorName, d.campaignTitle,
        d.category, d.amount, d.status,
        d.isAnonymous ? 'Yes' : 'No',
        d.message || '',
        new Date(d.createdAt).toLocaleDateString(),
      ])
      downloadCSV(`donations_report${dateRange}.csv`,
        ['ID', 'Donor', 'Campaign', 'Category', 'Amount ($)', 'Status', 'Anonymous', 'Message', 'Date'],
        rows)
      break
    }
    case 'reports': {
      const cRows = filterByDate(campaignReports).map(r => [
        r.id, 'Campaign', r.campaignTitle, r.reportedByName, r.reason,
        r.status, r.resolution || '', new Date(r.createdAt).toLocaleDateString(),
      ])
      const mRows = filterByDate(messageReports).map(r => [
        r.id, 'Message', r.messageContent.slice(0, 60), r.reportedByName, r.reason,
        r.status, '', new Date(r.createdAt).toLocaleDateString(),
      ])
      downloadCSV(`flagged_content_report${dateRange}.csv`,
        ['ID', 'Type', 'Content/Campaign', 'Reported By', 'Reason', 'Status', 'Resolution', 'Date'],
        [...cRows, ...mRows])
      break
    }
  }
}

export default function ExportReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('platform')
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exporting, setExporting] = useState(false)
  const [lastExported, setLastExported] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    // Simulate async export
    await new Promise(r => setTimeout(r, 600))
    exportReport(selectedType, startDate, endDate)
    setLastExported(new Date().toLocaleString())
    setExporting(false)
  }

  const selectedConfig = reportTypes.find(r => r.id === selectedType)!

  // Preview data for table
  const previewData = (() => {
    switch (selectedType) {
      case 'users':
        return {
          headers: ['Name', 'Email', 'Role', 'Status', 'Joined'],
          rows: users.slice(0, 5).map(u => [
            u.displayName, u.email, u.role, u.status,
            new Date(u.createdAt).toLocaleDateString(),
          ])
        }
      case 'campaigns':
        return {
          headers: ['Title', 'Category', 'Status', 'Raised', 'Donors'],
          rows: campaigns.slice(0, 5).map(c => [
            c.title.slice(0, 35) + (c.title.length > 35 ? '...' : ''),
            c.category, c.status,
            formatCurrency(c.raisedAmount),
            c.donorCount.toString(),
          ])
        }
      case 'donations':
        return {
          headers: ['Donor', 'Campaign', 'Amount', 'Status', 'Date'],
          rows: donations.slice(0, 5).map(d => [
            d.isAnonymous ? 'Anonymous' : d.donorName,
            d.campaignTitle.slice(0, 30) + '...',
            formatCurrency(d.amount), d.status,
            new Date(d.createdAt).toLocaleDateString(),
          ])
        }
      case 'reports':
        return {
          headers: ['Type', 'Content', 'Reason', 'Status', 'Date'],
          rows: [
            ...campaignReports.slice(0, 3).map(r => [
              'Campaign', r.campaignTitle.slice(0, 30), r.reason, r.status,
              new Date(r.createdAt).toLocaleDateString(),
            ]),
            ...messageReports.slice(0, 2).map(r => [
              'Message', r.messageContent.slice(0, 30) + '...', r.reason, r.status,
              new Date(r.createdAt).toLocaleDateString(),
            ]),
          ]
        }
      default: // platform
        return {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Users', platformStats.totalUsers.toLocaleString()],
            ['Active Campaigns', platformStats.activeCampaigns.toLocaleString()],
            ['Total Donations', platformStats.totalDonations.toLocaleString()],
            ['Total Raised', formatCurrency(platformStats.totalDonationAmount)],
            ['Avg Donation', formatCurrency(platformStats.averageDonation)],
          ]
        }
    }
  })()

  return (
    <DashboardLayout
      role="user_admin"
      user={{ name: adminUser.displayName, email: adminUser.email, role: 'Admin' }}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Export Reports</h1>
        <p className="text-muted-foreground">Generate and download platform reports as CSV files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Selection & Options */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Type</CardTitle>
              <CardDescription>Choose the data to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                    selectedType === rt.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/40 hover:bg-muted/50'
                  }`}
                >
                  <span className={`mt-0.5 ${rt.color}`}>{rt.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{rt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rt.description}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">{rt.rowCount} rows</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </CardTitle>
              <CardDescription>Filter by creation date (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate" className="text-sm">From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm">To</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full"
                onClick={() => { setStartDate(""); setEndDate("") }}
              >
                Clear dates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview and Export */}
        <div className="lg:col-span-2 space-y-6">
          {/* Export Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={selectedConfig.color}>{selectedConfig.icon}</span>
                {selectedConfig.title}
              </CardTitle>
              <CardDescription>{selectedConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedConfig.rowCount}</p>
                  <p className="text-muted-foreground">Records</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">CSV</p>
                  <p className="text-muted-foreground">Format</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{previewData.headers.length}</p>
                  <p className="text-muted-foreground">Columns</p>
                </div>
              </div>

              <Separator />

              {lastExported && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Last exported: {lastExported}
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
                size="lg"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Preview</CardTitle>
              <CardDescription>First 5 rows of the selected report</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData.headers.map(h => (
                        <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs py-2 max-w-[150px]">
                            <span className="truncate block">{cell}</span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground px-4 py-3 border-t border-border">
                Preview shows first 5 rows. The exported file will contain all {selectedConfig.rowCount} records.
              </p>
            </CardContent>
          </Card>

          {/* Quick Export Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Exports</CardTitle>
              <CardDescription>Export all reports at once for the current period</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {reportTypes.map(rt => (
                <Button
                  key={rt.id}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => exportReport(rt.id, startDate, endDate)}
                >
                  <span className={rt.color}>{rt.icon}</span>
                  <span className="text-xs">{rt.title}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
