import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const donee = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!donee || donee.role !== "donee") {
      return NextResponse.json(
        { error: "Donee account not found" },
        { status: 404 }
      )
    }

    const fullName = `${donee.firstName} ${donee.lastName}`.trim()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    /**
     * Current schema appears to link campaigns to beneficiaries by text fields,
     * not by a real doneeId / beneficiaryId.
     *
     * So we match campaigns using beneficiaryName.
     */
    let linkedCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { beneficiaryName: { contains: fullName } },
          { beneficiaryName: { contains: donee.firstName } },
          { beneficiaryName: { contains: donee.lastName } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        serviceType: true,
        status: true,
        targetAmount: true,
        raisedAmount: true,
        donorCount: true,
        views: true,
        favouriteCount: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        location: true,
        createdAt: true,
        beneficiaryName: true,
        beneficiaryDescription: true,
        organiser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    /**
     * Demo fallback:
     * If no campaigns are linked by beneficiaryName, use active campaigns
     * so the Donee dashboard still displays useful data for demo/testing.
     */
    if (linkedCampaigns.length === 0) {
      linkedCampaigns = await prisma.campaign.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          serviceType: true,
          status: true,
          targetAmount: true,
          raisedAmount: true,
          donorCount: true,
          views: true,
          favouriteCount: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          location: true,
          createdAt: true,
          beneficiaryName: true,
          beneficiaryDescription: true,
          organiser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    }

    const linkedCampaignIds = linkedCampaigns.map((campaign) => campaign.id)

    const [receivedDonations, thisMonthReceived, donorMessages] =
      await Promise.all([
        prisma.donation.findMany({
          where: {
            campaignId: {
              in: linkedCampaignIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            amount: true,
            status: true,
            donorName: true,
            donorEmail: true,
            isAnonymous: true,
            message: true,
            createdAt: true,
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),

        prisma.donation.aggregate({
          where: {
            campaignId: {
              in: linkedCampaignIds,
            },
            createdAt: {
              gte: startOfMonth,
            },
            status: "completed",
          },
          _sum: {
            amount: true,
          },
        }),

        prisma.donation.findMany({
          where: {
            campaignId: {
              in: linkedCampaignIds,
            },
            message: {
              not: null,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            amount: true,
            donorName: true,
            isAnonymous: true,
            message: true,
            createdAt: true,
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      ])

    const totalReceived = receivedDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    )

    const completedDonations = receivedDonations.filter(
      (donation) => donation.status === "completed"
    )

    const supporterCount = new Set(
      completedDonations.map((donation) =>
        donation.isAnonymous
          ? `anonymous-${donation.id}`
          : donation.donorEmail || donation.donorName || donation.id
      )
    ).size

    const milestoneAlerts = linkedCampaigns
      .map((campaign) => {
        const progress =
          campaign.targetAmount > 0
            ? Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
            : 0

        const reachedMilestone =
          progress >= 100
            ? 100
            : progress >= 75
              ? 75
              : progress >= 50
                ? 50
                : progress >= 25
                  ? 25
                  : null

        if (!reachedMilestone) return null

        return {
          campaignId: campaign.id,
          campaign: campaign.title,
          progress,
          milestone: reachedMilestone,
          createdAt: campaign.createdAt.toISOString(),
        }
      })
      .filter(Boolean)

    const donationActivity = receivedDonations.slice(0, 10).map((donation) => ({
      type: "donation" as const,
      campaignId: donation.campaign.id,
      campaign: donation.campaign.title,
      amount: donation.amount,
      createdAt: donation.createdAt.toISOString(),
    }))

    const messageActivity = donorMessages.slice(0, 10).map((message) => ({
      type: "message" as const,
      campaignId: message.campaign.id,
      campaign: message.campaign.title,
      amount: message.amount,
      createdAt: message.createdAt.toISOString(),
    }))

    const milestoneActivity = milestoneAlerts.map((milestone) => ({
      type: "milestone" as const,
      campaignId: milestone!.campaignId,
      campaign: milestone!.campaign,
      amount: null,
      createdAt: milestone!.createdAt,
    }))

    const recentActivity = [
      ...donationActivity,
      ...messageActivity,
      ...milestoneActivity,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalReceived: Math.round(totalReceived * 100) / 100,
        linkedActivities: linkedCampaigns.length,
        supporterCount,
        thisMonthReceived:
          Math.round((thisMonthReceived._sum.amount ?? 0) * 100) / 100,
        donorMessages: donorMessages.length,
        milestoneAlerts: milestoneAlerts.length,

        /**
         * Keep old field names too, so your current frontend will not break
         * if it still reads the older donor-style names.
         */
        totalDonated: Math.round(totalReceived * 100) / 100,
        campaignsSupported: linkedCampaigns.length,
        thisMonth:
          Math.round((thisMonthReceived._sum.amount ?? 0) * 100) / 100,
        activeFavourites: 0,
      },

      recentActivity,

      linkedCampaigns: linkedCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        summary: campaign.summary,
        category: campaign.category,
        serviceType: campaign.serviceType,
        status: campaign.status,
        targetAmount: campaign.targetAmount,
        raisedAmount: campaign.raisedAmount,
        donorCount: campaign.donorCount,
        views: campaign.views,
        favouriteCount: campaign.favouriteCount,
        coverImage: campaign.coverImage,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        location: campaign.location,
        createdAt: campaign.createdAt.toISOString(),
        beneficiaryName: campaign.beneficiaryName,
        beneficiaryDescription: campaign.beneficiaryDescription,
        organiser: {
          name: `${campaign.organiser.firstName} ${campaign.organiser.lastName}`,
        },
      })),

      donorMessages: donorMessages.map((message) => ({
        id: message.id,
        campaignId: message.campaign.id,
        campaign: message.campaign.title,
        donorName: message.isAnonymous
          ? "Anonymous"
          : message.donorName || "Unknown Donor",
        isAnonymous: message.isAnonymous,
        amount: message.amount,
        message: message.message,
        createdAt: message.createdAt.toISOString(),
      })),

      milestoneAlerts,
    })
  } catch (error) {
    console.error("Failed to load Donee dashboard:", error)

    return NextResponse.json(
      { error: "Failed to load Donee dashboard" },
      { status: 500 }
    )
  }
}