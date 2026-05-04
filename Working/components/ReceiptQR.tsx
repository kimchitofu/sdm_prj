"use client";

export default function ReceiptQR({
  qrCodeDataUrl,
}: {
  qrCodeDataUrl: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <img
        src={qrCodeDataUrl}
        alt="QR Verification"
        onClick={() => window.print()}
        title="Click to download receipt"
        className="w-28 h-28 cursor-pointer hover:scale-105 transition"
      />

      <p className="text-xs text-gray-400 mt-2">
        Click QR code to download receipt
      </p>
    </div>
  );
}