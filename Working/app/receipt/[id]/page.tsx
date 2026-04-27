import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ FIX: unwrap params (Next.js 16)
  const { id } = await params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      campaign: true,
    },
  });

  // ✅ if donation not found
  if (!donation) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full space-y-6">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-green-600">
          🎉 Thank You for Your Donation!
        </h1>

        {/* Receipt Box */}
        <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
          
          <p>
            <strong>Receipt No:</strong>{" "}
            DON-{donation.id.slice(-6).toUpperCase()}
          </p>

          <p>
            <strong>Campaign:</strong> {donation.campaign.title}
          </p>

          <p>
            <strong>Amount:</strong> ${donation.amount.toFixed(2)}
          </p>

          <p>
            <strong>Donor:</strong>{" "}
            {donation.isAnonymous ? "Anonymous" : donation.donorName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {donation.isAnonymous ? "-" : donation.donorEmail || "-"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(donation.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          
          <Link
            href={`/campaign/${donation.campaignId}`}
            className="flex-1 text-center border px-4 py-3 rounded-lg hover:bg-gray-100"
          >
            Back to Campaign
          </Link>

          {/* Only show for guest users */}
          {!donation.donorId && (
            <Link
              href={`/auth/register?donationId=${donation.id}`}
              className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}