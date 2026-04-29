"use client"

import { useState } from "react"
import Link from "next/link"
import {
  HandHeart,
  ArrowRight,
  Receipt,
  Compass,
  BookOpen,
  Star,
  TrendingUp,
  CalendarDays,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { ReceiptDialog, buildReceiptNo, type ReceiptDonation } from "@/components/donor/receipt-dialog"
import { campaigns, donations } from "@/lib/mock-data"
import { useCurrentUser } from "@/hooks/use-current-user"

const fallbackDonorUser = {
  email: "donor@example.com",
  displayName: "David Chen",
  firstName: "David",
  lastName: "Chen",
  role: "donor",
}

// Mock: recent giving pulled from donations list
const recentGiving: ReceiptDonation[] = donations.slice(0, 4).map(d => ({
  id: d.id,
  amount: d.amount,
  status: d.status,
  createdAt: d.createdAt,
  campaign: {
    id: d.campaignId,
    title: campaigns.find(c => c.id === d.campaignId)?.title ?? "Campaign",
  },
}))

// Category breakdown from all donations
const categoryTotals = donations.slice(0, 15).reduce<Record<string, number>>((acc, d) => {
  const cat = campaigns.find(c => c.id === d.campaignId)?.category ?? "Other"
  acc[cat] = (acc[cat] ?? 0) + d.amount
  return acc
}, {})
const totalAllDonated = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
const categoryBreakdown = Object.entries(categoryTotals)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 4)
  .map(([cat, amount]) => ({
    category: cat,
    amount,
    pct: Math.round((amount / totalAllDonated) * 100),
  }))

const discoverCampaigns = campaigns.filter(c => c.status === "active").slice(0, 3)

const categoryColours: Record<string, string> = {
  "Medical & Health":  "bg-rose-500",
  "Education":         "bg-blue-500",
  "Emergency Relief":  "bg-amber-500",
  "Community":         "bg-green-500",
  "Environment":       "bg-teal-500",
}
const colourFor = (cat: string) => categoryColours[cat] ?? "bg-primary"

export default function DonorHomePage() {
  const currentUser = useCurrentUser(fallbackDonorUser)
  const [receiptDonation, setReceiptDonation] = useState<ReceiptDonation | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)

  const firstName = currentUser.displayName?.split(" ")[0] ?? "there"

  return (
    <DashboardLayout
      role="donor"
      user={{
        name: currentUser.displayName,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: "Donor",
      }}
    >
      {/* ── Impact Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 mb-8 text-primary-foreground">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <HandHeart className="h-5 w-5" />
            <span className="text-sm font-medium opacity-80">Your Giving Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Hello, {firstName}!</h1>
          <p className="text-primary-foreground/70 mb-6 max-w-lg">
            Every donation you make changes lives. Here's the story of your generosity.
          </p>

          {/* Inline hero stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Given", value: fmt(totalAllDonated), icon: HandHeart },
              { label: "Campaigns Supported", value: String(new Set(donations.slice(0, 15).map(d => d.campaignId)).size), icon: Star },
              { label: "This Month", value: fmt(donations.slice(0, 3).reduce((s, d) => s + d.amount, 0)), icon: CalendarDays },
              { label: "Receipts Available", value: String(donations.slice(0, 15).length), icon: BadgeCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white/10 p-4">
                <Icon className="h-4 w-4 mb-2 opacity-70" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs opacity-70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content grid ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Recent Giving — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Giving</CardTitle>
            <Link href="/dashboard/donor/donations">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                See all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {recentGiving.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  i < recentGiving.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                {/* Colour dot */}
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <HandHeart className="h-4 w-4 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.campaign.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                {/* Amount */}
                <span className="text-sm font-bold text-primary shrink-0">{fmt(d.amount)}</span>

                {/* Receipt button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setReceiptDonation(d)}
                  title={`Receipt ${buildReceiptNo(d.id)}`}
                >
                  <Receipt className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Receipt</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right column — 1/3 width */}
        <div className="space-y-5">
          {/* Giving breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Where You Give
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {categoryBreakdown.map(({ category, amount, pct }) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground truncate max-w-[60%]">{category}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2"
                    indicatorClassName={colourFor(category)}
                  />
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt(amount)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { href: "/browse", label: "Browse Campaigns", icon: Compass },
                { href: "/dashboard/donor/donations", label: "All Receipts", icon: Receipt },
                { href: "/dashboard/donor/favourites", label: "My Saved Causes", icon: BookOpen },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="block">
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm font-normal">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Discover Campaigns ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Causes Worth Supporting</h2>
            <p className="text-sm text-muted-foreground">Active campaigns that need your help</p>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm">
              Explore all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {discoverCampaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>

      {/* Receipt dialog — triggered from Recent Giving */}
      {receiptDonation && (
        <ReceiptDialog
          donation={receiptDonation}
          donorName={currentUser.displayName}
          onClose={() => setReceiptDonation(null)}
        />
      )}
    </DashboardLayout>
  )
}
