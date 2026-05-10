"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  HandHeart,
  ExternalLink,
  DollarSign,
  CalendarDays,
  Target,
  MessageSquare,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/providers/session-provider"

type DoneeActivity = {
  id: string
  title: string
  summary: string | null
  description?: string | null
  category: string
  status: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  startDate: string
  endDate: string
  coverImage: string | null
  beneficiaryName?: string | null
  beneficiaryDescription?: string | null
  progress?: number
}

type DoneeDashboardResponse = {
  linkedCampaigns?: DoneeActivity[]
  recommendedCampaigns?: DoneeActivity[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getProgress(raisedAmount: number, targetAmount: number) {
  if (!targetAmount || targetAmount <= 0) return 0
  return Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
}

function getImpactMessage(progress: number) {
  if (progress >= 100) {
    return "This fundraising activity has reached its goal. The support collected can now make a strong impact."
  }

  if (progress >= 75) {
    return "This activity is close to reaching its goal. A final push could help complete the support needed."
  }

  if (progress >= 50) {
    return "This activity has passed the halfway mark. Support is building strongly."
  }

  if (progress >= 25) {
    return "This activity is gaining steady support from the community."
  }

  return "This activity is still in the early support stage and needs more visibility."
}

function getImpactUnits(category: string, raisedAmount: number) {
  const lowerCategory = category.toLowerCase()

  if (lowerCategory.includes("medical") || lowerCategory.includes("health")) {
    return {
      label: "Estimated medical support units",
      value: Math.max(1, Math.floor(raisedAmount / 500)),
      description: "based on an estimated $500 per medical support unit",
    }
  }

  if (lowerCategory.includes("education")) {
    return {
      label: "Estimated education support units",
      value: Math.max(1, Math.floor(raisedAmount / 300)),
      description: "based on an estimated $300 per education support unit",
    }
  }

  if (lowerCategory.includes("emergency") || lowerCategory.includes("relief")) {
    return {
      label: "Estimated relief packs supported",
      value: Math.max(1, Math.floor(raisedAmount / 100)),
      description: "based on an estimated $100 per relief pack",
    }
  }

  if (lowerCategory.includes("community")) {
    return {
      label: "Estimated community support units",
      value: Math.max(1, Math.floor(raisedAmount / 250)),
      description: "based on an estimated $250 per community support unit",
    }
  }

  return {
    label: "Estimated support units",
    value: Math.max(1, Math.floor(raisedAmount / 100)),
    description: "based on an estimated $100 per support unit",
  }
}

export default function DoneeActivitiesPage() {
  const { user } = useAuth()

  const [activities, setActivities] = useState<DoneeActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const sidebarUser = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: "Donee",
      }
    : undefined

  useEffect(() => {
    setLoading(true)
    setError("")

    fetch("/api/donee/dashboard")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load fundraising activities.")
        }

        return response.json()
      })
      .then((data: DoneeDashboardResponse) => {
        const sourceActivities =
          data.linkedCampaigns && data.linkedCampaigns.length > 0
            ? data.linkedCampaigns
            : data.recommendedCampaigns ?? []

        const mappedActivities = sourceActivities.map((activity) => ({
          ...activity,
          progress:
            typeof activity.progress === "number"
              ? activity.progress
              : getProgress(activity.raisedAmount, activity.targetAmount),
        }))

        setActivities(mappedActivities)
      })
      .catch(() => {
        setError("Unable to load fundraising activities. Please try again.")
        setActivities([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <DashboardLayout role="donee" user={sidebarUser}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Fundraising Activities
        </h1>
        <p className="text-muted-foreground">
          View fundraising activities created for you and track their purpose,
          target amount, campaign period, progress, and support impact.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive" />

            <h3 className="text-lg font-semibold mb-2">
              Failed to load activities
            </h3>

            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : activities.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activities.map((campaign) => {
            const progress = getProgress(
              campaign.raisedAmount,
              campaign.targetAmount
            )

            const remainingAmount = Math.max(
              campaign.targetAmount - campaign.raisedAmount,
              0
            )

            const impact = getImpactUnits(
              campaign.category,
              campaign.raisedAmount
            )

            return (
              <Card key={campaign.id} className="overflow-hidden">
                <div className="h-40 bg-muted overflow-hidden">
                  {campaign.coverImage ? (
                    <img
                      src={campaign.coverImage}
                      alt={campaign.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline">{campaign.category}</Badge>

                    <Badge
                      variant={
                        campaign.status === "active" ? "default" : "secondary"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg line-clamp-2">
                    {campaign.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {campaign.summary ||
                      campaign.description ||
                      "No summary provided."}
                  </p>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Raised
                      </span>

                      <span className="font-semibold">
                        {formatCurrency(campaign.raisedAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Target
                      </span>

                      <span className="font-semibold">
                        {formatCurrency(campaign.targetAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        Period
                      </span>

                      <span className="font-semibold text-right">
                        {formatDate(campaign.startDate)} -{" "}
                        {formatDate(campaign.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>

                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="mb-5 rounded-xl border bg-muted/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">
                        Support Impact Snapshot
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {getImpactMessage(progress)}
                    </p>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          {impact.label}
                        </span>

                        <span className="font-semibold text-right">
                          {impact.value}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground -mt-2 ml-6">
                        {impact.description}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Remaining amount
                        </span>

                        <span className="font-semibold text-right">
                          {formatCurrency(remainingAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Donors supporting this activity
                        </span>

                        <span className="font-semibold text-right">
                          {campaign.donorCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/dashboard/donee/donations">
                      <Button className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Related Donations
                      </Button>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/dashboard/donee/messages">
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                      </Link>

                      <Link href="/dashboard/donee/reports">
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Report
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
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <HandHeart className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              No fundraising activities found
            </h3>

            <p className="text-muted-foreground">
              There are currently no fundraising activities linked to your
              Donee account.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}