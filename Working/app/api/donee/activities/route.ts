import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Missing donee email." },
        { status: 400 }
      )
    }

    const donee = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!donee) {
      return NextResponse.json(
        { error: "Donee account not found." },
        { status: 404 }
      )
    }

    const firstName = donee.firstName || ""
    const lastName = donee.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim()

    let activities = await prisma.campaign.findMany({
      where: {
        OR: [
          fullName
            ? {
                beneficiaryName: {
                  contains: fullName,
                },
              }
            : undefined,
          firstName
            ? {
                beneficiaryName: {
                  contains: firstName,
                },
              }
            : undefined,
          lastName
            ? {
                beneficiaryName: {
                  contains: lastName,
                },
              }
            : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        category: true,
        status: true,
        targetAmount: true,
        raisedAmount: true,
        donorCount: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        beneficiaryName: true,
        beneficiaryDescription: true,
        createdAt: true,
      },
    })

    // Fallback for demo/testing:
    // if no campaign is directly linked to the Donee by beneficiaryName,
    // show active campaigns from the database.
    if (activities.length === 0) {
      activities = await prisma.campaign.findMany({
        where: {
          status: "active",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
        select: {
          id: true,
          title: true,
          summary: true,
          description: true,
          category: true,
          status: true,
          targetAmount: true,
          raisedAmount: true,
          donorCount: true,
          startDate: true,
          endDate: true,
          coverImage: true,
          beneficiaryName: true,
          beneficiaryDescription: true,
          createdAt: true,
        },
      })
    }

    const mappedActivities = activities.map((activity) => {
      const progress =
        activity.targetAmount > 0
          ? Math.min(
              100,
              Math.round((activity.raisedAmount / activity.targetAmount) * 100)
            )
          : 0

      return {
        id: activity.id,
        title: activity.title,
        summary: activity.summary,
        description: activity.description,
        category: activity.category,
        status: activity.status,
        targetAmount: activity.targetAmount,
        raisedAmount: activity.raisedAmount,
        donorCount: activity.donorCount,
        startDate: activity.startDate,
        endDate: activity.endDate,
        coverImage: activity.coverImage,
        beneficiaryName: activity.beneficiaryName,
        beneficiaryDescription: activity.beneficiaryDescription,
        createdAt: activity.createdAt.toISOString(),
        progress,
      }
    })

    return NextResponse.json({
      donee,
      activities: mappedActivities,
    })
  } catch (error) {
    console.error("Failed to load Donee activities:", error)

    return NextResponse.json(
      {
        error: "Failed to load Donee activities.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}