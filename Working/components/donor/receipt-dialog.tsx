"use client"

import { useState } from "react"
import {
  Receipt,
  Printer,
  Share2,
  Mail,
  Link2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface ReceiptDonation {
  id: string
  amount: number
  status: string
  createdAt: string
  campaign: {
    id: string
    title: string
  }
}

export function buildReceiptNo(id: string) {
  return `DON-${id.slice(-6).toUpperCase()}`
}

export function ReceiptDialog({
  donation,
  donorName,
  onClose,
}: {
  donation: ReceiptDonation
  donorName: string
  onClose: () => void
}) {
  const [emailTo, setEmailTo] = useState("")
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [emailError, setEmailError] = useState("")
  const [activePanel, setActivePanel] = useState<"none" | "email" | "share">("none")
  const [linkCopied, setLinkCopied] = useState(false)

  const receiptNo = buildReceiptNo(donation.id)
  const donationDate = new Date(donation.createdAt).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(donation.amount)

  const receiptUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/receipt/${donation.id}`
      : `/receipt/${donation.id}`

  const togglePanel = (panel: "email" | "share") => {
    setActivePanel(prev => (prev === panel ? "none" : panel))
    if (panel === "email") {
      setEmailStatus("idle")
      setEmailError("")
      setEmailTo("")
    }
    if (panel === "share") setLinkCopied(false)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=700,height=900")
    if (!printWindow) {
      toast.error("Pop-up blocked", {
        description: "Allow pop-ups for this site to download the receipt.",
      })
      return
    }
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${receiptNo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px}
    .card{background:#fff;border-radius:12px;max-width:520px;width:100%;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)}
    .header{background:#4f46e5;padding:32px;text-align:center}
    .header h1{color:#fff;font-size:22px;margin-bottom:4px}
    .header p{color:#c7d2fe;font-size:14px}
    .body{padding:32px}
    .thank-you{font-size:16px;margin-bottom:24px;color:#374151}
    .receipt-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px}
    .row:last-child{border-bottom:none}
    .label{color:#6b7280}
    .value{font-weight:600;color:#111827;text-align:right;max-width:60%}
    .amount-row{padding-top:16px;margin-top:8px;border-top:2px solid #e5e7eb}
    .amount-value{font-size:24px;color:#4f46e5}
    .status{display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:12px;font-size:12px}
    .footer{margin-top:24px;font-size:13px;color:#9ca3af;line-height:1.6}
    @media print{body{background:#fff;padding:0}.card{box-shadow:none;border-radius:0;max-width:100%}}
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>FundBridge</h1><p>Official Donation Receipt</p></div>
    <div class="body">
      <p class="thank-you">Thank you for your generous donation, <strong>${donorName}</strong>!</p>
      <div class="receipt-box">
        <div class="row"><span class="label">Receipt No</span><span class="value">${receiptNo}</span></div>
        <div class="row"><span class="label">Donation ID</span><span class="value" style="font-family:monospace;font-size:12px">${donation.id}</span></div>
        <div class="row"><span class="label">Campaign</span><span class="value">${donation.campaign.title}</span></div>
        <div class="row"><span class="label">Donor</span><span class="value">${donorName}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${donationDate}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="status">Completed</span></span></div>
        <div class="row amount-row"><span class="label" style="font-size:15px">Amount Donated</span><span class="value amount-value">${formattedAmount}</span></div>
      </div>
      <p class="footer">This receipt is issued as official confirmation of your donation to FundBridge.<br/>Please retain it for your personal records.</p>
    </div>
  </div>
  <script>window.onload=function(){window.print()}<\/script>
</body></html>`)
    printWindow.document.close()
  }

  const handleCopyLink = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Donation Receipt — ${receiptNo}`,
          text: `FundBridge receipt for a donation to ${donation.campaign.title} (${formattedAmount})`,
          url: receiptUrl,
        })
        return
      } catch {
        // cancelled or failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(receiptUrl)
      setLinkCopied(true)
      toast.success("Link copied!", { description: "Share this link so anyone can view the receipt." })
      setTimeout(() => setLinkCopied(false), 3000)
    } catch {
      toast.error("Could not copy", { description: "Please copy the link below manually." })
    }
  }

  const handleSendEmail = async () => {
    if (!emailTo || !/\S+@\S+\.\S+/.test(emailTo)) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setEmailStatus("sending")
    setEmailError("")
    try {
      const res = await fetch("/api/receipt/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          receiptNo,
          campaignTitle: donation.campaign.title,
          amount: donation.amount,
          donorName,
          donationDate,
          donationId: donation.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailStatus("error")
        setEmailError(data.error || "Failed to send email. Please try again.")
      } else {
        setEmailStatus("sent")
        toast.success("Receipt sent!", { description: `A copy has been delivered to ${emailTo}.` })
      }
    } catch {
      setEmailStatus("error")
      setEmailError("Network error. Please check your connection and try again.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Donation Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt details */}
          <div className="rounded-lg border bg-muted/30 p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt No</span>
              <span className="font-semibold">{receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donation ID</span>
              <span className="font-mono text-xs">{donation.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign</span>
              <span className="font-medium text-right max-w-[60%]">{donation.campaign.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donor</span>
              <span className="font-medium">{donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{donationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Amount Donated</span>
              <span className="text-2xl font-bold text-primary">{formattedAmount}</span>
            </div>
          </div>

          {/* Three action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handlePrint} variant="outline" className="flex-col h-auto py-3 gap-1">
              <Printer className="h-4 w-4" />
              <span className="text-xs">Download</span>
            </Button>
            <Button
              onClick={() => togglePanel("share")}
              variant={activePanel === "share" ? "secondary" : "outline"}
              className="flex-col h-auto py-3 gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
            <Button
              onClick={() => togglePanel("email")}
              variant={activePanel === "email" ? "secondary" : "outline"}
              className="flex-col h-auto py-3 gap-1"
            >
              <Mail className="h-4 w-4" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          {/* Share panel */}
          {activePanel === "share" && (
            <div className="rounded-lg border p-4 space-y-3 bg-background">
              <p className="text-sm font-medium">Share this receipt</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={receiptUrl}
                  className="font-mono text-xs text-muted-foreground"
                  onFocus={e => e.target.select()}
                />
                <Button
                  size="sm"
                  variant={linkCopied ? "default" : "outline"}
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {linkCopied ? <CheckCircle className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  <span className="ml-2">{linkCopied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the receipt page.
              </p>
            </div>
          )}

          {/* Email panel */}
          {activePanel === "email" && (
            <div className="rounded-lg border p-4 space-y-3 bg-background">
              <p className="text-sm font-medium">Email this receipt</p>
              {emailStatus === "sent" ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Receipt delivered to {emailTo}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="receipt-email" className="text-sm">Recipient email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="receipt-email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={emailTo}
                        onChange={e => { setEmailTo(e.target.value); setEmailError("") }}
                        className={emailError ? "border-destructive" : ""}
                        disabled={emailStatus === "sending"}
                        onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      />
                      <Button
                        onClick={handleSendEmail}
                        disabled={emailStatus === "sending"}
                        size="sm"
                        className="shrink-0"
                      >
                        {emailStatus === "sending"
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Download className="h-4 w-4" />}
                        <span className="ml-2">{emailStatus === "sending" ? "Sending…" : "Send"}</span>
                      </Button>
                    </div>
                    {(emailError || emailStatus === "error") && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {emailError || "Failed to send. Please try again."}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A formatted receipt will be delivered to the address above.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
