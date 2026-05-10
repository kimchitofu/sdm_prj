import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lock, Heart, Users, CalendarDays, Gift, Info } from "lucide-react";
import { LiveCampaignProgress } from "@/components/campaigns/live-campaign-progress";
import { ShareCampaignButton } from "@/components/campaigns/share-campaign-button";
import { CampaignVerificationBadge } from "@/components/campaigns/campaign-verification-badge";

export default async function CampaignDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ guest?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  // Guest mode only when URL has ?guest=true
  const isGuest = query.guest === "true";

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      updates: { orderBy: { createdAt: "desc" } },
      donations: {
      orderBy: { createdAt: "desc" },
      },
      organiser: true,
    },
  });

  if (!campaign) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-600">
            Campaign not found
          </p>

          <p className="text-sm text-gray-600 mt-1">
            This campaign does not exist or may have been removed.
          </p>

          <Link
            href="/browse"
            className="mt-4 inline-block text-sm text-blue-600 underline"
          >
            Browse other campaigns
          </Link>
        </div>
      </main>
    );
  }

  const progress =
    campaign.targetAmount > 0
      ? Math.min(
          Math.round(
            (campaign.raisedAmount / campaign.targetAmount) * 100
          ),
          100
        )
      : 0;

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Guest-only section */}
      {isGuest && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-1" />

            <div>
              <h2 className="font-semibold text-blue-800">
                Guest Campaign View
              </h2>

              <p className="text-sm text-blue-700 mt-1">
                You can view campaign details, progress,
                updates, recent donations, and impact
                information before donating. No account
                is required to donate as a guest.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Campaign Header */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <CampaignVerificationBadge
            status={campaign.status}
          />
        </div>

        <h1 className="text-3xl font-bold">
          {campaign.title}
        </h1>

        <p className="text-gray-600 mt-2">
          {campaign.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500">
              Target Amount
            </p>

            <p className="text-xl font-semibold">
              ${campaign.targetAmount.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500">
              Raised Amount
            </p>

            <p className="text-xl font-semibold">
              ${campaign.raisedAmount.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500">
              Progress
            </p>

            <p className="text-xl font-semibold">
              {progress}% funded
            </p>
          </div>
        </div>

        <p className="mt-6 leading-relaxed">
          {campaign.description}
        </p>
      </section>

      {/* Live Progress */}
      <LiveCampaignProgress
        campaignId={campaign.id}
        initialRaisedAmount={campaign.raisedAmount}
        targetAmount={campaign.targetAmount}
        initialDonorCount={campaign.donorCount}
      />

      {/* Guest-only Donation Impact */}
      {isGuest && (
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Donation Impact Information
          </h2>

          <p className="text-gray-600 mb-5">
            This section helps guest users understand
            how their donation may support the campaign
            before they decide to donate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <Gift className="h-6 w-6 mb-2 text-blue-600" />

              <p className="font-semibold">
                $10 Donation
              </p>

              <p className="text-sm text-gray-600">
                Helps provide basic support for the
                campaign.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <Heart className="h-6 w-6 mb-2 text-blue-600" />

              <p className="font-semibold">
                $50 Donation
              </p>

              <p className="text-sm text-gray-600">
                Helps create a stronger impact for
                beneficiaries.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <Users className="h-6 w-6 mb-2 text-blue-600" />

              <p className="font-semibold">
                $100 Donation
              </p>

              <p className="text-sm text-gray-600">
                Helps the campaign reach more people
                in need.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Campaign Updates */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">
          Campaign Updates
        </h2>

        {campaign.updates.length === 0 ? (
          <p className="text-gray-500">
            No updates have been posted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {campaign.updates.map((update) => (
              <div
                key={update.id}
                className="border rounded-lg p-4"
              >
                <h3 className="font-semibold">
                  {update.title}
                </h3>

                <p className="mt-2 text-gray-700">
                  {update.content}
                </p>

                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />

                  {update.createdAt.toLocaleDateString(
                    "en-SG",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Donations */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">
          Recent Donations
        </h2>

        {campaign.donations.length === 0 ? (
          <p className="text-gray-500">
            No donations have been made yet.
          </p>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {campaign.donations.map((donation) => (
              <div
                key={donation.id}
                className="border rounded-lg p-4"
              >
                <p className="font-medium">
                  {donation.isAnonymous
                    ? "Anonymous donor"
                    : donation.donorName ||
                      "Guest donor"}{" "}
                  donated $
                  {donation.amount.toFixed(2)}
                </p>

                {donation.message && (
                  <p className="text-gray-600 mt-1">
                    "{donation.message}"
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  {new Date(donation.createdAt).toLocaleString("en-SG", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Donate Button */}
      {campaign.status === "locked" ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-5 py-4 text-red-600">
          <Lock className="h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              This campaign has been locked
            </p>

            <p className="text-sm">
              This campaign has been flagged and is
              no longer accepting donations.
            </p>
          </div>
        </div>
      ) : (
        <Link
          href={`/campaign/${campaign.id}/donate`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {isGuest ? "Donate as Guest" : "Donate Now"}
        </Link>
      )}

      {/* Share Campaign */}
      <ShareCampaignButton
        campaignId={campaign.id}
        campaignTitle={campaign.title}
      />
    </main>
  );
}