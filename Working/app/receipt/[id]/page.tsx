import { prisma } from "@/lib/prisma";

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
    return <div className="p-8">Receipt not found.</div>;
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Donation Receipt</h1>

      <div className="border p-6 rounded space-y-3">
        <p>
          <strong>Receipt No:</strong> DON-{donation.id.slice(-6).toUpperCase()}
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
          <strong>Email:</strong> {donation.donorEmail || "Not provided"}
        </p>

        <p>
          <strong>Date:</strong> {donation.createdAt.toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}