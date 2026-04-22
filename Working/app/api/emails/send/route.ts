import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface SendEmailRequestBody {
  to?: string[]
  subject?: string
  text?: string
  campaignId?: string
  campaignTitle?: string
  triggerKey?: string
  useConfiguredSenderAsRecipient?: boolean
}

function normaliseRecipients(input: unknown): string[] {
  if (!Array.isArray(input)) return []

  return Array.from(
    new Set(
      input
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
}

function extractEmailAddress(fromValue: string): string {
  const match = fromValue.match(/<([^>]+)>/)
  return match?.[1]?.trim() || fromValue.trim()
}

function buildTransport() {
  const host = process.env.EMAIL_SMTP_HOST
  const port = Number(process.env.EMAIL_SMTP_PORT || 587)
  const secure = parseBooleanEnv(process.env.EMAIL_SMTP_SECURE, port === 465)
  const user = process.env.EMAIL_SMTP_USER
  const pass = process.env.EMAIL_SMTP_PASS
  const requireTLS = parseBooleanEnv(process.env.EMAIL_SMTP_REQUIRE_TLS, !secure)

  if (!host) {
    throw new Error("Missing EMAIL_SMTP_HOST. Add it to your .env.local file.")
  }

  if (!user) {
    throw new Error("Missing EMAIL_SMTP_USER. Add it to your .env.local file.")
  }

  if (!pass) {
    throw new Error("Missing EMAIL_SMTP_PASS. Add it to your .env.local file.")
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    auth: {
      user,
      pass,
    },
  })
}

export async function POST(request: Request) {
  const from = process.env.EMAIL_FROM

  if (!from) {
    return NextResponse.json(
      { error: "Missing EMAIL_FROM. Add it to your .env.local file." },
      { status: 500 }
    )
  }

  let body: SendEmailRequestBody

  try {
    body = (await request.json()) as SendEmailRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 })
  }

  const configuredSmtpUser = process.env.EMAIL_SMTP_USER?.trim()
  const recipients = body.useConfiguredSenderAsRecipient
    ? configuredSmtpUser
      ? [configuredSmtpUser]
      : []
    : normaliseRecipients(body.to)
  const subject = body.subject?.trim()
  const text = body.text?.trim()

  if (recipients.length <= 0) {
    return NextResponse.json(
      {
        error: body.useConfiguredSenderAsRecipient
          ? "Missing EMAIL_SMTP_USER. Add it to your .env.local file."
          : "At least one recipient email is required.",
      },
      { status: 400 }
    )
  }

  if (!subject) {
    return NextResponse.json({ error: "Email subject is required." }, { status: 400 })
  }

  if (!text) {
    return NextResponse.json({ error: "Email body is required." }, { status: 400 })
  }

  try {
    const transporter = buildTransport()

    const html = text
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
      .join("")

    const fromAddress = extractEmailAddress(from)
    const singleRecipient = recipients.length === 1

    const info = await transporter.sendMail({
      from,
      to: singleRecipient ? recipients[0] : fromAddress,
      bcc: singleRecipient ? undefined : recipients,
      subject,
      text,
      html,
      headers: {
        ...(body.campaignId ? { "X-Campaign-Id": body.campaignId } : {}),
        ...(body.campaignTitle ? { "X-Campaign-Title": body.campaignTitle } : {}),
        ...(body.triggerKey ? { "X-Trigger-Key": body.triggerKey } : {}),
      },
    })

    return NextResponse.json({
      ok: true,
      deliveredCount: recipients.length,
      resolvedRecipients: recipients,
      messageId: info.messageId,
      envelope: info.envelope,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to send the email right now.",
      },
      { status: 500 }
    )
  }
}
