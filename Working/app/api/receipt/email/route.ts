import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface ReceiptEmailBody {
  to: string
  receiptNo: string
  campaignTitle: string
  amount: number
  donorName: string
  donationDate: string
  donationId: string
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

export async function POST(request: Request) {
  const from = process.env.EMAIL_FROM
  const host = process.env.EMAIL_SMTP_HOST
  const user = process.env.EMAIL_SMTP_USER
  const pass = process.env.EMAIL_SMTP_PASS

  if (!from || !host || !user || !pass) {
    return NextResponse.json(
      { error: 'Email service is not configured on this server.' },
      { status: 503 }
    )
  }

  let body: ReceiptEmailBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { to, receiptNo, campaignTitle, amount, donorName, donationDate, donationId } = body

  if (!to || !/\S+@\S+\.\S+/.test(to)) {
    return NextResponse.json({ error: 'A valid recipient email is required.' }, { status: 400 })
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)

  const subject = `Donation Receipt — ${receiptNo}`

  const text = `FundBridge — Donation Receipt\n\n` +
    `Thank you for your generous donation, ${donorName}!\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Receipt No:    ${receiptNo}\n` +
    `Donation ID:   ${donationId}\n` +
    `Campaign:      ${campaignTitle}\n` +
    `Amount:        ${formattedAmount}\n` +
    `Donor:         ${donorName}\n` +
    `Date:          ${donationDate}\n` +
    `Status:        Completed\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `This receipt serves as confirmation of your donation to FundBridge.\n` +
    `Please keep it for your records.\n\n` +
    `Thank you for making a difference.\n` +
    `— The FundBridge Team`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #4f46e5; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FundBridge</h1>
        <p style="color: #c7d2fe; margin: 8px 0 0;">Donation Receipt</p>
      </div>
      <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-top: 0;">
          Thank you for your generous donation, <strong>${donorName}</strong>!
        </p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Receipt No</td>
              <td style="padding: 8px 0; font-weight: 600;">${receiptNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Donation ID</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${donationId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Campaign</td>
              <td style="padding: 8px 0; font-weight: 600;">${campaignTitle}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
              <td style="padding: 12px 0 8px; color: #6b7280;">Amount</td>
              <td style="padding: 12px 0 8px; font-size: 22px; font-weight: 700; color: #4f46e5;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Donor</td>
              <td style="padding: 8px 0;">${donorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date</td>
              <td style="padding: 8px 0;">${donationDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Status</td>
              <td style="padding: 8px 0;">
                <span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">Completed</span>
              </td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          This receipt serves as confirmation of your donation to FundBridge.
          Please keep it for your records.
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
          Thank you for making a difference.<br/>
          <strong>— The FundBridge Team</strong>
        </p>
      </div>
    </div>
  `

  try {
    const port = Number(process.env.EMAIL_SMTP_PORT || 587)
    const secure = parseBooleanEnv(process.env.EMAIL_SMTP_SECURE, port === 465)
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
    await transporter.sendMail({ from, to, subject, text, html })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email.' },
      { status: 500 }
    )
  }
}
