import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      campaign: true,
    },
  });

  if (!donation) {
    return notFound();
  }

  const receiptCode = `DON-${donation.id.slice(-8).toUpperCase()}`;

  const processingFee = Number(
    (donation.amount * 0.029 + 0.3).toFixed(2)
  );

  const totalPaid = Number(
    (donation.amount + processingFee).toFixed(2)
  );

  const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const verificationUrl = `${baseUrl}/receipt/${donation.id}`;

  const qrCodeDataUrl = await QRCode.toDataURL(
    verificationUrl
  );

  const progressPercentage = Math.min(
    (donation.campaign.raisedAmount /
      donation.campaign.targetAmount) *
      100,
    100
  );

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-4 max-w-4xl w-full space-y-5">

        {/* Header */}
        <div className="text-center">
          <p className="text-green-600 font-semibold uppercase tracking-wide">
            Verified Donation Receipt
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Thank You for Your Donation
          </h1>

          <p className="text-gray-500 mt-2">
            Your contribution has been successfully recorded.
          </p>
        </div>

        {/* Status + Receipt */}
        <div className="grid md:grid-cols-2 gap-4">

          <div className="border rounded-xl p-5 bg-green-50">
            <p className="text-sm text-gray-500">
              Receipt Code
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {receiptCode}
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-blue-50">
            <p className="text-sm text-gray-500">
              Donation Status
            </p>

            <p className="text-2xl font-bold text-blue-700 mt-1 capitalize">
              {donation.status}
            </p>
          </div>
        </div>

        {/* Guest Donation Linking Code */}
        {!donation.donorId && (
        <div className="border rounded-xl p-5 bg-blue-50">
          <p className="text-sm text-blue-700">
            Guest Donation Linking Code
          </p>

          <p className="text-2xl font-bold text-blue-900 mt-1">
            {donation.receiptCode || "No linking code found"}
          </p>

          <p className="text-sm text-blue-600 mt-2">
            Use this code together with your email address
            to link this donation to a registered donor account later.
          </p>
        </div>
      )}


        {/* Donation Details */}
        <div className="border rounded-xl p-6 space-y-4 bg-gray-50">

          <h2 className="text-xl font-semibold">
            Donation Summary
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Campaign</p>
              <p className="font-medium">
                {donation.campaign.title}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Donation Date</p>
              <p className="font-medium">
                {new Date(
                  donation.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Donor</p>

              <p className="font-medium">
                {donation.isAnonymous
                  ? "Anonymous"
                  : donation.donorName}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>

              <p className="font-medium break-all">
                {donation.isAnonymous
                  ? "-"
                  : donation.donorEmail || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Donation Amount
              </p>

              <p className="font-medium">
                ${donation.amount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Processing Fee
              </p>

              <p className="font-medium">
                ${processingFee.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Total Paid
              </p>

              <p className="font-bold text-green-700">
                ${totalPaid.toFixed(2)}
              </p>
            </div>

          </div>
        </div>

        {/* Campaign Progress */}
        <div className="border rounded-xl p-6 space-y-4">

          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">
              Campaign Progress
            </h2>

            <p className="font-semibold text-green-700">
              {progressPercentage.toFixed(0)}%
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-600 h-4 rounded-full"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <p>
              Raised: $
              {donation.campaign.raisedAmount.toFixed(2)}
            </p>

            <p>
              Goal: $
              {donation.campaign.targetAmount.toFixed(2)}
            </p>
          </div>
        </div>
        {/* Guest User QR Verification */}
        {!donation.donorId && (
          <div className="border rounded-xl p-6 text-center space-y-4">

            <h2 className="text-xl font-semibold">
              Receipt Verification
            </h2>

            <p className="text-sm text-gray-500">
              Scan this QR code to verify this donation receipt.
            </p>

            <div className="flex justify-center">
              <img
                src={qrCodeDataUrl}
                alt="QR Verification"
                className="w-28 h-28"
              />
            </div>

            <p className="text-sm break-all text-gray-500">
              {verificationUrl}
            </p>

          </div>
        )}
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">

          <Link
            href={`/campaign/${donation.campaignId}`}
            className="flex-1 text-center border px-4 py-3 rounded-xl hover:bg-gray-100"
          >
            Back to Campaign
          </Link>

          {!donation.donorId && (
            <Link
              href={`/auth/register?donationId=${donation.id}`}
              className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}