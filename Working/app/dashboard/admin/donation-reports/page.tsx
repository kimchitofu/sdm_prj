"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuth } from "@/components/providers/session-provider"

function formatCurrency(v: number) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type DailyTotal = { date: string; total: number; count: number; avg: number }
type DonationRow = {
  id: string
  amount: number
  donorName: string
  isAnonymous: boolean
  campaignTitle: string
  category: string
  status: string
  createdAt: string
}
type ReportSummary = {
  totalAmount: number
  totalCount: number
  avgDonation: number
  peakDate: string | null
  peakAmount: number
}

type ReportData = {
  dailyTotals: DailyTotal[]
  donations: DonationRow[]
  summary: ReportSummary
}

export default function DonationReportsPage() {
  const { user: sessionUser } = useAuth()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState("")
  const [drillDate, setDrillDate] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError("")
    setReport(null)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('start', startDate)
      if (endDate) params.set('end', endDate)
      const res = await fetch(`/api/admin/donation-reports?${params}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      const data: ReportData = await res.json()
      setReport(data)
    } catch {
      setError("Failed to generate report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!report) return
    const filename = `donation_report_${startDate || 'all'}_to_${endDate || 'all'}.csv`
    const headers = ['Date', 'Total Amount ($)', 'Donation Count', 'Avg Donation ($)']
    const rows = report.dailyTotals.map((d) => [d.date, d.total, d.count, d.avg])
    downloadCSV(filename, headers, rows)
  }

  const drillDonations = useMemo(() => {
    if (!drillDate || !report) return []
    return report.donations.filter((d) => d.createdAt.split('T')[0] === drillDate)
  }, [drillDate, report])

  const sidebarUser = sessionUser
    ? { name: `${sessionUser.firstName} ${sessionUser.lastName}`, email: sessionUser.email, role: sessionUser.role }
    : undefined

  return (
    <DashboardLayout role={(sessionUser?.role as import('@/lib/types').UserRole) ?? 'admin'} user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Donation Reports</h1>
        <p className="text-muted-foreground">
          Generate aggregated daily donation volume reports. Filter by date range and export as CSV.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Report Parameters
          </CardTitle>
          <CardDescription>Select a date range to filter donations. Leave blank to include all time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start" className="text-sm">From Date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end" className="text-sm">To Date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(""); setEndDate("") }}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading} className="whitespace-nowrap">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" />Generate Report</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm mb-6 p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!report && !isLoading && !error && (
        <div className="py-24 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No report generated yet</p>
          <p className="text-sm mt-1">Set a date range above and click Generate Report.</p>
        </div>
      )}

      {report && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Raised"
              value={formatCurrency(report.summary.totalAmount)}
              icon={<DollarSign className="h-5 w-5" />}
              description={`${report.summary.totalCount} donations`}
            />
            <StatsCard
              title="Avg Donation"
              value={formatCurrency(report.summary.avgDonation)}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Per transaction"
            />
            <StatsCard
              title="Total Donations"
              value={report.summary.totalCount.toLocaleString()}
              icon={<BarChart3 className="h-5 w-5" />}
              description="In selected period"
            />
            <StatsCard
              title="Peak Day"
              value={report.summary.peakDate ?? '—'}
              icon={<Calendar className="h-5 w-5" />}
              description={report.summary.peakDate ? formatCurrency(report.summary.peakAmount) : 'No data'}
            />
          </div>

          {/* Chart */}
          {report.dailyTotals.length > 0 ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Daily Donation Volume</CardTitle>
                <CardDescription>Total donation amounts per day in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={report.dailyTotals} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Total']}
                      labelFormatter={(l: unknown) => `Date: ${l}`}
                    />
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Total Donated"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <div className="py-12 text-center text-muted-foreground mb-8">
              No donations found for the selected period.
            </div>
          )}

          {/* Table + Export */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Breakdown</CardTitle>
                <CardDescription>
                  Click any row to view individual donations for that day.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={report.dailyTotals.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Donations</TableHead>
                    <TableHead className="text-right">Avg Donation</TableHead>
                    <TableHead>Peak?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.dailyTotals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No data available for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.dailyTotals.map((row) => (
                      <TableRow
                        key={row.date}
                        className={`cursor-pointer hover:bg-muted/50 ${row.date === report.summary.peakDate ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                        onClick={() => setDrillDate(row.date)}
                      >
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(row.total)}
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(row.avg)}
                        </TableCell>
                        <TableCell>
                          {row.date === report.summary.peakDate && (
                            <Badge className="bg-amber-500 text-white text-xs">Peak</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {report.dailyTotals.length > 0 && (
                    <TableRow className="border-t-2 font-semibold bg-muted/30">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(report.summary.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">{report.summary.totalCount}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(report.summary.avgDonation)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Drill-down: donations for a specific day */}
      <Dialog open={!!drillDate} onOpenChange={(open) => !open && setDrillDate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donations on {drillDate}</DialogTitle>
            <DialogDescription>
              {drillDonations.length} donation{drillDonations.length !== 1 ? 's' : ''} — total{' '}
              {formatCurrency(drillDonations.reduce((s, d) => s + d.amount, 0))}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drillDonations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm font-medium">
                    {d.donorName}
                    {d.isAnonymous && <Badge variant="outline" className="ml-1 text-xs">Anon</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px]">
                    <span className="line-clamp-1">{d.campaignTitle}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(d.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
