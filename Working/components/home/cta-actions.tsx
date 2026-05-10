"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/session-provider"

export function CtaActions() {
  const { user } = useAuth()
  const isDonor = user?.role === "donor" || user?.role === "donee"

  return (
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      {!isDonor && (
        <Button size="lg" variant="secondary" asChild>
          <Link href="/auth/register?role=fund_raiser">
            Start a Campaign
          </Link>
        </Button>
      )}
      <Button
        size="lg"
        variant="outline"
        className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
        asChild
      >
        <Link href="/browse">
          Explore Campaigns
        </Link>
      </Button>
    </div>
  )
}
