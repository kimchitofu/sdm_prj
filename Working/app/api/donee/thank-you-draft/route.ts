import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type FallbackCampaign = {
  title?: string
  category?: string
  raisedAmount?: number
  targetAmount?: number
  donorCount?: number
}

type ThankYouTone = "warm" | "formal" | "emotional"

function getProgress(raisedAmount: number, targetAmount: number) {
  if (!targetAmount || targetAmount <= 0) return 0

  return Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
}

function getToneOpening(tone: ThankYouTone) {
  switch (tone) {
    case "formal":
      return "I sincerely appreciate your generous support"
    case "emotional":
      return "I am truly touched by your kindness and support"
    case "warm":
    default:
      return "Thank you so much for your kindness and support"
  }
}

function getToneClosing(tone: ThankYouTone) {
  switch (tone) {
    case "formal":
      return "Your contribution is deeply appreciated."
    case "emotional":
      return "Your encouragement gives me hope, strength, and comfort during this journey."
    case "warm":
    default:
      return "Your support means a lot and helps me keep moving forward."
  }
}

function getSupporterText(count: number) {
  if (count <= 0) return "supporters"
  return `${count} supporter${count === 1 ? "" : "s"}`
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const campaignId = body.campaignId as string | undefined
    const tone = ((body.tone as string | undefined) || "warm") as ThankYouTone
    const fallbackCampaign = body.campaign as FallbackCampaign | undefined

    if (!campaignId && !fallbackCampaign?.title) {
      return NextResponse.json(
        { error: "Missing campaign details" },
        { status: 400 }
      )
    }

    const dbCampaign = campaignId
      ? await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: {
            id: true,
            title: true,
            category: true,
            raisedAmount: true,
            targetAmount: true,
            donorCount: true,
          },
        })
      : null

    const campaign = dbCampaign || {
      id: campaignId || "demo-campaign",
      title: fallbackCampaign?.title || "this fundraising activity",
      category: fallbackCampaign?.category || "General",
      raisedAmount: fallbackCampaign?.raisedAmount || 0,
      targetAmount: fallbackCampaign?.targetAmount || 0,
      donorCount: fallbackCampaign?.donorCount || 0,
    }

    const recentDonations = campaignId
      ? await prisma.donation
          .findMany({
            where: {
              campaignId,
              status: "completed",
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
            select: {
              donorName: true,
              isAnonymous: true,
              message: true,
              amount: true,
            },
          })
          .catch(() => [])
      : []

    const progress = getProgress(campaign.raisedAmount, campaign.targetAmount)

    const totalRecentAmount =
      recentDonations.length > 0
        ? recentDonations.reduce((sum, donation) => sum + donation.amount, 0)
        : campaign.raisedAmount

    const donorPhrase =
      recentDonations.length > 0
        ? `${recentDonations.length} recent supporter${
            recentDonations.length === 1 ? "" : "s"
          }`
        : getSupporterText(campaign.donorCount)

    const encouragementMessages = recentDonations
      .filter(
        (donation) => donation.message && donation.message.trim().length > 0
      )
      .slice(0, 2)
      .map((donation) => {
        const donorName = donation.isAnonymous
          ? "Anonymous supporter"
          : donation.donorName || "A supporter"

        return `${donorName} shared: “${donation.message}”`
      })

    const toneOpening = getToneOpening(tone)
    const toneClosing = getToneClosing(tone)

    const messageSection =
      encouragementMessages.length > 0
        ? `\n\nI also want to acknowledge the kind messages shared by supporters:\n${encouragementMessages
            .map((message) => `- ${message}`)
            .join("\n")}`
        : ""

    const draft = `${toneOpening} for "${campaign.title}".

Because of donors like you, this fundraising activity has reached ${progress}% of its goal. Support from ${donorPhrase} has contributed $${totalRecentAmount.toLocaleString()} toward this cause.${messageSection}

Every donation and message of encouragement makes a real difference. ${toneClosing}

With gratitude,
The Donee`

    return NextResponse.json({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      category: campaign.category,
      tone,
      progress,
      donorCount: campaign.donorCount,
      totalRecentAmount,
      draft,
      source: dbCampaign ? "database" : "fallback",
    })
  } catch (error) {
    console.error("Failed to generate thank-you draft:", error)

    return NextResponse.json(
      {
        error: "Failed to generate thank-you draft",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}