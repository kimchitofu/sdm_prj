import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { EmailAutomationTriggerController, type WorkflowResult } from "@/app/controller/EmailAutomationTriggerController"

const emailAutomationTriggerController = new EmailAutomationTriggerController()

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

  let workflowResult: WorkflowResult

  try {
    workflowResult = await emailAutomationTriggerController.triggerCampaignUpdateWorkflow({
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
