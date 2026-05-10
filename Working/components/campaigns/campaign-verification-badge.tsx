"use client"

import {
  ShieldCheck,
  ShieldQuestion,
  ShieldAlert,
  ShieldX,
  Lock,
  Clock,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatusConfig {
  label: string
  description: string
  icon: React.ElementType
  className: string
}

// Maps DB campaign.status values → donor-facing badge config.
// Admin "approves" a campaign by setting status = "active" in the DB.
const STATUS_MAP: Record<string, StatusConfig> = {
  active: {
    label: "Verified",
    description:
      "This campaign has been reviewed and approved by FundBridge administrators. You can donate with confidence.",
    icon: ShieldCheck,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  under_review: {
    label: "Under Review",
    description:
      "FundBridge administrators are currently reviewing this campaign. Verification is in progress.",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Pending Review",
    description:
      "This campaign has not yet been reviewed by FundBridge administrators.",
    icon: ShieldQuestion,
    className: "bg-muted text-muted-foreground border-border",
  },
  pending_review: {
    label: "Pending Review",
    description:
      "This campaign is awaiting review by FundBridge administrators.",
    icon: ShieldQuestion,
    className: "bg-muted text-muted-foreground border-border",
  },
  on_hold: {
    label: "On Hold",
    description:
      "This campaign has been temporarily placed on hold pending further administrative review.",
    icon: ShieldAlert,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "Not Approved",
    description:
      "This campaign did not pass the FundBridge review process and is not approved for fundraising.",
    icon: ShieldX,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  locked: {
    label: "Locked",
    description:
      "This campaign has been locked by FundBridge administrators due to a policy or fraud concern.",
    icon: Lock,
    className: "bg-red-100 text-red-800 border-red-300",
  },
}

const UNAVAILABLE: StatusConfig = {
  label: "Status Unavailable",
  description:
    "Campaign verification status is temporarily unavailable. Please check back later.",
  icon: ShieldQuestion,
  className: "bg-muted text-muted-foreground border-border",
}

export function CampaignVerificationBadge({ status }: { status: string | null | undefined }) {
  const config = (status && STATUS_MAP[status]) ? STATUS_MAP[status] : UNAVAILABLE
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium cursor-default select-none ${config.className}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {config.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64 text-center text-xs">
          {config.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
