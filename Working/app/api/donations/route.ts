import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { EmailAutomationTriggerController, type WorkflowResult } from "@/app/controller/EmailAutomationTriggerController"

const emailAutomationTriggerController = new EmailAutomationTriggerController()

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const donations = await prisma.donation.findMany({
    where: { donorId: session.id },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          category: true,
          raisedAmount: true,
          targetAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ donations });
}

export async function POST(request: NextRequest) {
  const {
    campaignId,
    amount,
    isAnonymous,
    message,
    donorName,
    donorEmail,
  } = await request.json()

  const donationAmount = Number(amount)

  if (!campaignId || !donationAmount || donationAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid donation data" },
      { status: 400 }
    )
  }

  const session = await getSession()

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      targetAmount: true,
      raisedAmount: true,
      donorCount: true,
      status: true,
      organiser: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    )
  }

  if (campaign.status === 'locked') {
    return NextResponse.json(
      { error: "This campaign has been locked and cannot accept donations." },
      { status: 403 }
    );
  }

  const finalDonorName = isAnonymous
    ? "Anonymous"
    : session
    ? `${session.firstName} ${session.lastName}`
    : donorName || "Guest Donor"

  const finalDonorEmail = session ? session.email : donorEmail || null

  const receiptCode = `RCPT-${Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()}`

  const donation = await prisma.donation.create({
    data: {
      campaignId,
      donorId: session?.id ?? null,
      donorName: finalDonorName,
      donorEmail: finalDonorEmail,
      amount: donationAmount,
      isAnonymous: isAnonymous ?? false,
      message: message || null,
      status: "completed",
      receiptCode,
    },
  })

  const previousRaisedAmount = Number(campaign.raisedAmount || 0)
  const previousDonorCount = Number(campaign.donorCount || 0)
  const nextRaisedAmount = previousRaisedAmount + donationAmount
  const nextDonorCount = previousDonorCount + 1

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      raisedAmount: { increment: donationAmount },
      donorCount: { increment: 1 },
    },
  })

  let thankYouWorkflow: WorkflowResult
  let newDonationAlertWorkflow: WorkflowResult
  let milestoneWorkflow: WorkflowResult

  try {
    thankYouWorkflow = await emailAutomationTriggerController.triggerThankYouWorkflow({
      request,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      targetAmount: Number(campaign.targetAmount || 0),
      raisedAmount: nextRaisedAmount,
      donorCount: nextDonorCount,
      fundRaiserName: `${campaign.organiser.firstName} ${campaign.organiser.lastName}`.trim() || "Fund Raiser",
      donorEmail: finalDonorEmail,
    })
  } catch (error) {
    thankYouWorkflow = {
      attempted: false,
      deliveredCount: 0,
      reason: error instanceof Error ? error.message : "Thank-you workflow email failed.",
    }
  }

  try {
    newDonationAlertWorkflow = await emailAutomationTriggerController.triggerNewDonationAlertWorkflow({
      request,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      targetAmount: Number(campaign.targetAmount || 0),
      raisedAmount: nextRaisedAmount,
      donorCount: nextDonorCount,
      fundRaiserName: `${campaign.organiser.firstName} ${campaign.organiser.lastName}`.trim() || "Fund Raiser",
      fundRaiserEmail: campaign.organiser.email || null,
    })
  } catch (error) {
    newDonationAlertWorkflow = {
      attempted: false,
      deliveredCount: 0,
      reason: error instanceof Error ? error.message : "New donation alert workflow email failed.",
    }
  }

  try {
    milestoneWorkflow = await emailAutomationTriggerController.triggerMilestoneWorkflow({
      request,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      targetAmount: Number(campaign.targetAmount || 0),
      previousRaisedAmount,
      raisedAmount: nextRaisedAmount,
      donorCount: nextDonorCount,
      fundRaiserName: `${campaign.organiser.firstName} ${campaign.organiser.lastName}`.trim() || "Fund Raiser",
    })
  } catch (error) {
    milestoneWorkflow = {
      attempted: false,
      deliveredCount: 0,
      reason: error instanceof Error ? error.message : "Milestone workflow email failed.",
    }
  }

  return NextResponse.json({
    success: true,
    donationId: donation.id,
    confirmationNumber: `DON-${donation.id.slice(-8).toUpperCase()}`,
    receiptCode,
    thankYouWorkflow,
    newDonationAlertWorkflow,
    milestoneWorkflow,
  })
}
