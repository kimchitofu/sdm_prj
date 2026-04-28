import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { EmailTemplate } from "@/app/entity/EmailTemplate"

async function verifyOwnership(campaignId: string, userId: string) {
  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      organiserId: userId,
    },
    select: {
      id: true,
      title: true,
      targetAmount: true,
      raisedAmount: true,
      donorCount: true,
      organiserId: true,
    },
  })
}

async function loadRecentUpdates(campaignId: string) {
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
    },
  })

  return updates.map((update) => ({
    ...update,
    createdAt: update.createdAt.toISOString(),
  }))
}

function mapRuleKey(triggerType: string): "manual_update" | null {
  if (triggerType === "campaign_update" || triggerType === "manual_update") {
    return "manual_update"
  }

  return null
}

async function triggerCampaignUpdateWorkflow(input: {
  request: NextRequest
  campaignId: string
  campaignTitle: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  fundRaiserName: string
  updateTitle: string
  updateContent: string
}) {
  const workflowRule = await prisma.emailAutomationRule.findFirst({
    where: {
      triggerType: {
        in: ["campaign_update", "manual_update"],
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      triggerType: true,
      subject: true,
      body: true,
      isActive: true,
    },
  })

  if (!workflowRule) {
    return {
      attempted: false,
      deliveredCount: 0,
      reason: "Campaign update workflow is not enabled.",
    }
  }

  const recipients = Array.from(
    new Set(
      (
        await prisma.donation.findMany({
          where: {
            campaignId: input.campaignId,
            status: "completed",
            donorEmail: {
              not: null,
            },
          },
          select: {
            donorEmail: true,
          },
        })
      )
        .map((donation) => donation.donorEmail?.trim())
        .filter((email): email is string => Boolean(email))
    )
  )

  if (recipients.length === 0) {
    return {
      attempted: false,
      deliveredCount: 0,
      reason: "No donor email recipients are available for this campaign yet.",
    }
  }

  const template = new EmailTemplate({
    id: workflowRule.id,
    ruleKey: mapRuleKey(workflowRule.triggerType) || "manual_update",
    label: workflowRule.name,
    description: "Campaign update workflow template.",
    subjectTemplate: workflowRule.subject,
    bodyTemplate: workflowRule.body,
    updatedAt: undefined,
  })

  const replacements = {
    campaignTitle: input.campaignTitle,
    targetAmount: Number(input.targetAmount || 0).toLocaleString(),
    raisedAmount: Number(input.raisedAmount || 0).toLocaleString(),
    donorCount: Number(input.donorCount || 0).toLocaleString(),
    fundRaiserName: input.fundRaiserName,
    recipientLabel: "supporter",
    milestonePercent: undefined,
    campaignUpdateTitle: input.updateTitle,
    campaignUpdateContent: input.updateContent,
    campaignUpdateDate: new Date().toLocaleString(),
    updateTitle: input.updateTitle,
    updateContent: input.updateContent,
  }

  const subject = template.renderSubject(replacements)
  const body = template.renderBody(replacements)

  const sendResponse = await fetch(`${input.request.nextUrl.origin}/api/fund-raiser/email-send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: recipients,
      subject,
      text: body,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: "manual_update",
      templateId: workflowRule.id,
    }),
    cache: "no-store",
  })

  const sendPayload = await sendResponse.json().catch(() => null)

  if (!sendResponse.ok) {
    throw new Error(
      (sendPayload && typeof sendPayload.error === "string" && sendPayload.error) ||
        "Campaign update workflow email failed to send."
    )
  }

  return {
    attempted: true,
    deliveredCount:
      sendPayload && typeof sendPayload.deliveredCount === "number"
        ? sendPayload.deliveredCount
        : recipients.length,
    messageId:
      sendPayload && typeof sendPayload.messageId === "string" ? sendPayload.messageId : undefined,
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "fund_raiser") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const campaignId = request.nextUrl.searchParams.get("campaignId")
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required." }, { status: 400 })
  }

  const ownedCampaign = await verifyOwnership(campaignId, session.id)
  if (!ownedCampaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  }

  const updates = await loadRecentUpdates(campaignId)

  return NextResponse.json({ updates })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "fund_raiser") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const campaignId = typeof body?.campaignId === "string" ? body.campaignId : ""
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const content = typeof body?.content === "string" ? body.content.trim() : ""

  if (!campaignId || !title || !content) {
    return NextResponse.json({ error: "Campaign, title, and content are required." }, { status: 400 })
  }

  const ownedCampaign = await verifyOwnership(campaignId, session.id)
  if (!ownedCampaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  }

  await prisma.campaignUpdate.create({
    data: {
      campaignId,
      title,
      content,
    },
  })

  const updates = await loadRecentUpdates(campaignId)

  let workflowResult:
    | { attempted: false; deliveredCount: 0; reason: string }
    | { attempted: true; deliveredCount: number; messageId?: string }

  try {
    workflowResult = await triggerCampaignUpdateWorkflow({
      request,
      campaignId,
      campaignTitle: ownedCampaign.title,
      targetAmount: Number(ownedCampaign.targetAmount || 0),
      raisedAmount: Number(ownedCampaign.raisedAmount || 0),
      donorCount: Number(ownedCampaign.donorCount || 0),
      fundRaiserName: `${session.firstName} ${session.lastName}`.trim() || "Fund Raiser",
      updateTitle: title,
      updateContent: content,
    })
  } catch (error) {
    workflowResult = {
      attempted: false,
      deliveredCount: 0,
      reason: error instanceof Error ? error.message : "Campaign update email workflow failed.",
    }
  }

  return NextResponse.json({
    success: true,
    campaignTitle: ownedCampaign.title,
    updates,
    workflow: workflowResult,
  })
}
