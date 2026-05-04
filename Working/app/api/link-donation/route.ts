import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "You must be logged in to link a donation." },
      { status: 401 }
    );
  }

  const { donorEmail, receiptCode } = await request.json();

  if (!donorEmail || !receiptCode) {
    return NextResponse.json(
      { error: "Email and receipt code are required." },
      { status: 400 }
    );
  }

  const donation = await prisma.donation.findFirst({
    where: {
      donorEmail: donorEmail.trim(),
      receiptCode: receiptCode.trim(),
      donorId: null,
    },
  });

  if (!donation) {
    return NextResponse.json(
      {
        error:
          "No matching guest donation found. Please check your email and receipt code.",
      },
      { status: 404 }
    );
  }

  await prisma.donation.update({
    where: {
      id: donation.id,
    },
    data: {
      donorId: session.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Guest donation linked successfully.",
  });
}