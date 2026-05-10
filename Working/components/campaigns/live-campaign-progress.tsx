"use client";

import { useEffect, useState } from "react";

type LiveCampaignProgressProps = {
  campaignId: string;
  initialRaisedAmount: number;
  targetAmount: number;
  initialDonorCount: number;
};

export function LiveCampaignProgress({
  campaignId,
  initialRaisedAmount,
  targetAmount,
  initialDonorCount,
}: LiveCampaignProgressProps) {
  const [raisedAmount, setRaisedAmount] = useState(initialRaisedAmount);
  const [donorCount, setDonorCount] = useState(initialDonorCount);

  const progress =
    targetAmount > 0 ? Math.round((raisedAmount / targetAmount) * 100) : 0;

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/campaign/${campaignId}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setRaisedAmount(data.raisedAmount);
        setDonorCount(data.donorCount);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [campaignId]);

  return (
    <section>
      <h2 className="text-2xl font-semibold">Campaign Progress</h2>

      <p>
        ${raisedAmount.toFixed(2)} raised of ${targetAmount.toFixed(2)}
      </p>

      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p className="mt-2">{progress}% funded</p>
      <p className="text-sm text-gray-600">{donorCount} donors contributed</p>
    </section>
  );
}