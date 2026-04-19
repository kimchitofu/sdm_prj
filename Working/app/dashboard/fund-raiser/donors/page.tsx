"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Mail,
  Search,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react"
import { DonorDashboardController } from "@/app/controller/DonorDashboardController"
import type { DonorFilter, DonorSort } from "@/app/entity/Donor"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatsCard } from "@/components/ui/stats-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCurrentUser } from "@/hooks/use-current-user"
import { campaigns, donations, users } from "@/lib/mock-data"

const donorDashboardController = new DonorDashboardController(campaigns, donations, users)
const defaultFundRaiserUser = donorDashboardController.getDefaultFundRaiserUser() || users[1]

export default function FundRaiserDonorDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<DonorFilter>("all")
  const [sortBy, setSortBy] = useState<DonorSort>("latest")

  const storedUser = useCurrentUser({
    displayName: defaultFundRaiserUser.displayName,
    email: defaultFundRaiserUser.email,
    avatar: defaultFundRaiserUser.avatar,
  })

  const fundRaiserUser = useMemo(() => {
    return donorDashboardController.resolveFundRaiserUser({
      id: storedUser.id,
      email: storedUser.email,
    }) || defaultFundRaiserUser
  }, [storedUser.email, storedUser.id])

  const dashboard = useMemo(() => {
    return donorDashboardController.buildDashboard(fundRaiserUser.id, {
      searchQuery,
      filter,
      sortBy,
    })
  }, [fundRaiserUser.id, searchQuery, filter, sortBy])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value))
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
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Donor Dashboard
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            View donor activity across your campaigns, identify repeat supporters, and move straight into email actions by donor segment.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/dashboard/fund-raiser/campaigns">
              View campaigns
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href={dashboard.currentFilterEmailHref || "/dashboard/fund-raiser/emails"}>
              <Mail className="mr-2 h-4 w-4" />
              {dashboard.currentFilterEmailHref ? "Email current segment" : "Open email actions"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Total Donors"
          value={dashboard.donorSummary.length.toString()}
          icon={<Users className="h-5 w-5" />}
          description="Unique supporters across your campaigns"
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Repeat Donors"
          value={dashboard.stats.repeatDonorCount.toString()}
          icon={<Tag className="h-5 w-5" />}
          description="Donors who supported you more than once"
          trend={{ value: 12, isPositive: true }}
          variant="info"
        />
        <StatsCard
          title="High Value Donors"
          value={dashboard.stats.highValueDonorCount.toString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          description="Supporters with total giving above $1,000"
          trend={{ value: 9, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Average Donor Value"
          value={formatCurrency(dashboard.stats.averageDonorValue)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Average total donation amount per donor"
          trend={{ value: 7, isPositive: true }}
          variant="warning"
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.75fr_1fr]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Donor segments</CardTitle>
            <CardDescription>
              Jump directly into the email automation page with a preselected donor audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.segmentCards.map((segment) => (
              <div key={segment.key} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  {segment.key === "high_value" && <ShieldCheck className="h-4 w-4" />}
                  {segment.key === "repeat" && <Tag className="h-4 w-4" />}
                  {segment.key === "recent" && <Calendar className="h-4 w-4" />}
                  {segment.key === "anonymous" && <Users className="h-4 w-4" />}
                  {segment.label}
                </div>
                <p className="text-2xl font-semibold text-foreground">{segment.count}</p>
                <p className="mt-1 min-h-12 text-sm text-muted-foreground">{segment.description}</p>
                <Button asChild className="mt-4 w-full" size="sm" variant="outline">
                  <Link href={segment.emailHref}>
                    Email segment
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Top donors</CardTitle>
            <CardDescription>Highest-value supporters across your fundraising portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.topDonors.map((donor, index) => (
              <div key={donor.donorId} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={donor.donorAvatar} />
                  <AvatarFallback>{donor.donorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">#{index + 1} {donor.donorName}</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(donor.totalDonated)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {donor.donationCount} donations across {donor.campaignsSupported} campaigns
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {donor.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Donor list</CardTitle>
                <CardDescription>
                  Search and segment supporters before sending thank-you, milestone, and follow-up emails.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search donor, email, or tag"
                    className="pl-9"
                  />
                </div>
                <Select value={filter} onValueChange={(value) => setFilter(value as DonorFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter donors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All donors</SelectItem>
                    <SelectItem value="high_value">High value</SelectItem>
                    <SelectItem value="repeat">Repeat donors</SelectItem>
                    <SelectItem value="recent">Recent supporters</SelectItem>
                    <SelectItem value="anonymous">Anonymous givers</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as DonorSort)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort donors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest donation</SelectItem>
                    <SelectItem value="highest">Highest total</SelectItem>
                    <SelectItem value="most_donations">Most donations</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {dashboard.currentFilterEmailHref && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">
                  Your current donor filter is ready to carry into the email automation page.
                </p>
                <Button asChild size="sm">
                  <Link href={dashboard.currentFilterEmailHref}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email this segment
                  </Link>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Total donated</TableHead>
                    <TableHead>Donations</TableHead>
                    <TableHead>Largest gift</TableHead>
                    <TableHead>Last donation</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.filteredDonors.map((donor) => (
                    <TableRow key={donor.donorId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={donor.donorAvatar} />
                            <AvatarFallback>{donor.donorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{donor.donorName}</p>
                            <p className="text-sm text-muted-foreground">{donor.donorEmail || "No email captured"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(donor.totalDonated)}</TableCell>
                      <TableCell>{donor.donationCount}</TableCell>
                      <TableCell>{formatCurrency(donor.largestDonation)}</TableCell>
                      <TableCell>{formatDate(donor.lastDonationAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {donor.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent donor activity</CardTitle>
            <CardDescription>Latest completed donations across your campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentActivity.map((activity) => (
              <div key={activity.donationId} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{activity.donorName}</p>
                    <p className="text-sm text-muted-foreground">{activity.campaignTitle}</p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(activity.amount)}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{formatDate(activity.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
