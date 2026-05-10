"use client"

import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/session-provider"

export function HeroActions() {
  const { user } = useAuth()
  const isDonor = user?.role === "donor" || user?.role === "donee"
  const isAdmin = user?.role === "admin" || user?.role === "campaign_admin"

  return (
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      {!isDonor && !isAdmin && (
        <Button size="lg" asChild>
          <Link href="/auth/register">
            Start Fundraising
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
      <Button size="lg" variant={isDonor ? "default" : "outline"} asChild>
        <Link href="/browse">
          <Search className="mr-2 h-4 w-4" />
          Browse Campaigns
        </Link>
      </Button>
    </div>
  )
}
