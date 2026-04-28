import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const {
    campaignId,
    amount,
    isAnonymous,
    message,
    donorName,
    donorEmail,
  } = await request.json();

  const donationAmount = Number(amount);

  if (!campaignId || !donationAmount || donationAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid donation data" },
      { status: 400 }
    );
  }

  const session = await getSession();

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    );
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
    : donorName || "Guest Donor";

  const finalDonorEmail = session ? session.email : donorEmail || null;

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
    },
  });

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      raisedAmount: { increment: donationAmount },
      donorCount: { increment: 1 },
    },
  });

  return NextResponse.json({
    success: true,
    donationId: donation.id,
    confirmationNumber: `DON-${donation.id.slice(-8).toUpperCase()}`,
  });
}