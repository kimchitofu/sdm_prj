"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  HandHeart,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Award,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuth } from "@/components/providers/session-provider"

interface DashboardStats {
  totalDonated?: number
  activeFavourites?: number
  campaignsSupported?: number
  thisMonth?: number

  totalReceived?: number
  linkedActivities?: number
  supporterCount?: number
  thisMonthReceived?: number
  donorMessages?: number
  milestoneAlerts?: number
}

interface RecentActivity {
  type: "donation" | "favourite" | "message" | "milestone"
  campaignId: string
  campaign: string
  amount: number | null
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  recommendedCampaigns?: unknown[]
  linkedCampaigns?: unknown[]
  donorMessages?: unknown[]
  milestoneAlerts?: unknown[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) {
    return `${Math.max(minutes, 1)} minute${minutes !== 1 ? "s" : ""} ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

export default function DoneeDashboardPage() {
  const { user: sessionUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/donee/dashboard")
      .then((response) => response.json())
      .then((dashboardData) => setData(dashboardData))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const firstName = sessionUser?.firstName || "Donee"

  const sidebarUser = sessionUser
    ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email,
        role: "Donee",
      }
    : undefined

  /**
   * Some older API fields are still donor-style:
   * totalDonated, campaignsSupported, thisMonth.
   *
   * We map them into Donee wording here so the UI matches the Donee role
   * without breaking the existing API route.
   */
  const totalReceived =
    data?.stats.totalReceived ?? data?.stats.totalDonated ?? 0

  const linkedActivities =
    data?.stats.linkedActivities ?? data?.stats.campaignsSupported ?? 0

  const thisMonthReceived =
    data?.stats.thisMonthReceived ?? data?.stats.thisMonth ?? 0

  const supporterCount =
    data?.stats.supporterCount ??
    data?.recentActivity?.filter((activity) => activity.type === "donation")
      .length ??
    0

  const donorMessageCount =
    data?.stats.donorMessages ?? data?.donorMessages?.length ?? 0

  const milestoneAlertCount =
    data?.stats.milestoneAlerts ?? data?.milestoneAlerts?.length ?? 0

  return (
    <DashboardLayout role="donee" user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of fundraising activities, donations, donor
          messages, reports, and milestone alerts linked to you.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Received"
              value={formatCurrency(totalReceived)}
              icon={<DollarSign className="h-5 w-5" />}
              description="Total support received"
            />

            <StatsCard
              title="Linked Activities"
              value={linkedActivities.toString()}
              icon={<HandHeart className="h-5 w-5" />}
              description="Fundraising activities"
            />

            <StatsCard
              title="Supporters"
              value={supporterCount.toString()}
              icon={<Users className="h-5 w-5" />}
              description="Donors who supported you"
            />

            <StatsCard
              title="This Month Received"
              value={formatCurrency(thisMonthReceived)}
              icon={<Award className="h-5 w-5" />}
              description="Last 30 days"
            />
          </div>

          {/* Quick Actions and Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Access your Donee features quickly.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <Link href="/dashboard/donee/activities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <HandHeart className="h-4 w-4 mr-2" />
                    Fundraising Activities
                  </Button>
                </Link>

                <Link href="/dashboard/donee/donations" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Received Donations
                  </Button>
                </Link>

                <Link href="/dashboard/donee/messages" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Donor Messages
                  </Button>
                </Link>

                <Link href="/dashboard/donee/reports" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </Link>

                <Link href="/dashboard/donee/milestones" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Milestones
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Support Activity</CardTitle>
                  <CardDescription>
                    Latest donations and updates from fundraising activities
                    linked to you.
                  </CardDescription>
                </div>

                <Link href="/dashboard/donee/donations">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent>
                {(data?.recentActivity ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No support activity has been recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(data?.recentActivity ?? []).map((activity, index) => (
                      <div
                        key={`${activity.campaignId}-${index}`}
                        className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                          {activity.type === "message" ? (
                            <MessageSquare className="h-5 w-5" />
                          ) : activity.type === "milestone" ? (
                            <Award className="h-5 w-5" />
                          ) : (
                            <DollarSign className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {activity.type === "donation"
                              ? "Donation received for"
                              : activity.type === "message"
                                ? "New donor message for"
                                : activity.type === "milestone"
                                  ? "Milestone reached for"
                                  : "Activity on"}{" "}
                            {activity.campaign}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {timeAgo(activity.createdAt)}
                          </p>
                        </div>

                        {activity.amount !== null && (
                          <Badge variant="secondary" className="font-semibold">
                            {formatCurrency(activity.amount)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Donee Use Case Summary */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Donor Messages
                </CardTitle>
                <CardDescription>
                  Encouragement messages received from supporters.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold mb-4">{donorMessageCount}</p>
                <Link href="/dashboard/donee/messages">
                  <Button variant="outline" className="w-full justify-between">
                    View Messages
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Support Report
                </CardTitle>
                <CardDescription>
                  Download a summary of funds and support received.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  {linkedActivities}
                </p>
                <Link href="/dashboard/donee/reports">
                  <Button variant="outline" className="w-full justify-between">
                    View Report
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Milestones
                </CardTitle>
                <CardDescription>
                  Alerts when linked campaigns reach key progress points.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  {milestoneAlertCount}
                </p>
                <Link href="/dashboard/donee/milestones">
                  <Button variant="outline" className="w-full justify-between">
                    View Milestones
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </DashboardLayout>
  )
}