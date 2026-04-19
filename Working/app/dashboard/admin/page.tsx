"use client"

import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { donations, dailyStats, reportSummary, formatCurrency } from "@/lib/mock-data"

const adminUser = {
  displayName: 'Super Admin',
  email: 'admin@gmail.com',
}

// Donation trend for the chart
const donationTrend = dailyStats.map(d => ({
  date: d.date.slice(5), // MM-DD
  amount: d.amount,
  count: d.donations,
}))

// Category breakdown for pie chart
const categoryData = reportSummary.topCategories.map(c => ({
  name: c.category,
  value: c.amount,
}))

const PIE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

// Quick KPIs (used for category breakdown above)

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      role="user_admin"
      user={{ name: adminUser.displayName, email: adminUser.email, role: 'Admin' }}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Donation activity and platform overview.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Raised"
          value={formatCurrency(reportSummary.stats.totalDonationAmount)}
          icon={<DollarSign className="h-5 w-5" />}
          description="All time"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Donations"
          value={reportSummary.stats.totalDonations.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Transactions"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg Donation"
          value={formatCurrency(reportSummary.stats.averageDonation)}
          icon={<BarChart3 className="h-5 w-5" />}
          description="Per transaction"
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Active Campaigns"
          value={reportSummary.stats.activeCampaigns.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="Currently running"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Donation Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Donation Trend</CardTitle>
            <CardDescription>Daily donation amounts over the past 10 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={donationTrend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Donation distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Donation Counts Bar Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Transaction Count</CardTitle>
          <CardDescription>Number of donations processed per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donationTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Donations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest platform donation activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {d.isAnonymous ? 'Anonymous' : d.donorName}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {d.campaignTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    +{formatCurrency(d.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.status === 'completed' ? 'default' : d.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
