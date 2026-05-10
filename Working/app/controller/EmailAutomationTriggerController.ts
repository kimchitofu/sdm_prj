import "server-only"

import { NextRequest } from "next/server"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"
import { EmailTemplate } from "@/app/entity/EmailTemplate"


export interface SendEmailRequestBody {
  to?: string[]
  subject?: string
  text?: string
  campaignId?: string
  campaignTitle?: string
  triggerKey?: string
  templateId?: string | null
  useConfiguredSenderAsRecipient?: boolean
}

const VALID_TRIGGER_KEYS = new Set([
  "manual_update",
  "thank_you",
  "milestone",
  "new_donation_alert",
])

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

function normaliseTriggerKey(value?: string): string | null {
  if (!value) return null
  return VALID_TRIGGER_KEYS.has(value) ? value : null
}

function mapTriggerKeyToTriggerTypes(triggerKey: string | null): string[] {
  switch (triggerKey) {
    case "manual_update":
      return ["campaign_update", "manual_update"]
    case "thank_you":
      return ["donation_received", "thank_you"]
    case "milestone":
      return ["milestone_50", "milestone"]
    case "new_donation_alert":
      return ["new_donation_alert", "donation_alert"]
    default:
      return []
  }
}

export type WorkflowResult =
  | { attempted: false; deliveredCount: 0; reason: string }
  | { attempted: true; deliveredCount: number; messageId?: string }

const MILESTONE_THRESHOLDS = [25, 50, 75, 100] as const

type CampaignUpdateRuleKey = "manual_update"
type DonationRuleKey = "thank_you" | "milestone" | "new_donation_alert"

type WorkflowRuleRecord = {
  id: string
  name: string
  triggerType: string
  subject: string
  body: string
}

function buildTemplateReplacements(input: {
  campaignTitle: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  fundRaiserName: string
  recipientLabel?: string
  milestonePercent?: number
  campaignUpdateTitle?: string
  campaignUpdateContent?: string
  campaignUpdateDate?: string
  updateTitle?: string
  updateContent?: string
}) {
  return {
    campaignTitle: input.campaignTitle,
    targetAmount: Number(input.targetAmount || 0).toLocaleString(),
    raisedAmount: Number(input.raisedAmount || 0).toLocaleString(),
    donorCount: Number(input.donorCount || 0).toLocaleString(),
    fundRaiserName: input.fundRaiserName,
    recipientLabel: input.recipientLabel || "supporter",
    milestonePercent: input.milestonePercent,
    campaignUpdateTitle: input.campaignUpdateTitle,
    campaignUpdateContent: input.campaignUpdateContent,
    campaignUpdateDate: input.campaignUpdateDate,
    updateTitle: input.updateTitle,
    updateContent: input.updateContent,
  }
}

function mapCampaignUpdateRuleKey(triggerType: string): CampaignUpdateRuleKey {
  return triggerType === "campaign_update" || triggerType === "manual_update" ? "manual_update" : "manual_update"
}

function mapDonationRuleKey(triggerType: string): DonationRuleKey {
  if (triggerType === "donation_received" || triggerType === "thank_you") {
    return "thank_you"
  }

  if (triggerType === "milestone_50" || triggerType === "milestone") {
    return "milestone"
  }

  return "new_donation_alert"
}

export class EmailAutomationTriggerController {
  private async resolveTemplateId(
    explicitTemplateId: string | null | undefined,
    triggerKey: string | null
  ): Promise<string | null> {
    if (explicitTemplateId) return explicitTemplateId

    const triggerTypes = mapTriggerKeyToTriggerTypes(triggerKey)
    if (triggerTypes.length === 0) return null

    const rule = await prisma.emailAutomationRule.findFirst({
      where: {
        triggerType: {
          in: triggerTypes,
        },
      },
      select: {
        id: true,
      },
    })

    return rule?.id ?? null
  }

  private async persistLogs(payload: {
    recipients: string[]
    subject: string
    body: string
    status: "sent" | "failed"
    campaignId?: string
    templateId?: string | null
  }) {
    if (payload.recipients.length === 0) return

    await prisma.emailLog.createMany({
      data: payload.recipients.map((recipientEmail) => ({
        recipientEmail,
        subject: payload.subject,
        body: payload.body,
        status: payload.status,
        campaignId: payload.campaignId || null,
        templateId: payload.templateId || null,
        sentAt: new Date(),
      })),
    })
  }

  async sendEmail(body: SendEmailRequestBody): Promise<{ status: number; body: Record<string, unknown> }> {
    const from = process.env.EMAIL_FROM

    if (!from) {
      return {
        status: 500,
        body: { error: "Missing EMAIL_FROM. Add it to your .env.local file." },
      }
    }

    const configuredSmtpUser = process.env.EMAIL_SMTP_USER?.trim()
    const recipients = body.useConfiguredSenderAsRecipient
      ? configuredSmtpUser
        ? [configuredSmtpUser]
        : []
      : normaliseRecipients(body.to)

    const subject = body.subject?.trim()
    const text = body.text?.trim()
    const triggerKey = normaliseTriggerKey(body.triggerKey)

    if (recipients.length <= 0) {
      return {
        status: 400,
        body: {
          error: body.useConfiguredSenderAsRecipient
            ? "Missing EMAIL_SMTP_USER. Add it to your .env.local file."
            : "At least one recipient email is required.",
        },
      }
    }

    if (!subject) {
      return { status: 400, body: { error: "Email subject is required." } }
    }

    if (!text) {
      return { status: 400, body: { error: "Email body is required." } }
    }

    const templateId = await this.resolveTemplateId(body.templateId, triggerKey)

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
          ...(triggerKey ? { "X-Trigger-Key": triggerKey } : {}),
        },
      })

      let logPersistenceError: string | null = null

      try {
        await this.persistLogs({
          recipients,
          subject,
          body: text,
          status: "sent",
          campaignId: body.campaignId,
          templateId,
        })
      } catch (error) {
        console.error("Failed to persist sent email logs:", error)
        logPersistenceError =
          error instanceof Error ? error.message : "Unable to persist sent email logs."
      }

      return {
        status: 200,
        body: {
          ok: true,
          deliveredCount: recipients.length,
          resolvedRecipients: recipients,
          messageId: info.messageId,
          envelope: info.envelope,
          templateId,
          ...(logPersistenceError ? { logPersistenceError } : {}),
        },
      }
    } catch (error) {
      let logPersistenceError: string | null = null

      try {
        await this.persistLogs({
          recipients,
          subject,
          body: text,
          status: "failed",
          campaignId: body.campaignId,
          templateId,
        })
      } catch (logError) {
        console.error("Failed to persist failed email logs:", logError)
        logPersistenceError =
          logError instanceof Error ? logError.message : "Unable to persist failed email logs."
      }

      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : "Unable to send the email right now.",
          templateId,
          ...(logPersistenceError ? { logPersistenceError } : {}),
        },
      }
    }
  }

  private async findActiveWorkflowRule(input: {
    triggerTypes: string[]
    workflowRuleId?: string | null
  }): Promise<WorkflowRuleRecord | null> {
    return input.workflowRuleId
      ? await prisma.emailAutomationRule.findFirst({
          where: {
            id: input.workflowRuleId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            triggerType: true,
            subject: true,
            body: true,
          },
        })
      : await prisma.emailAutomationRule.findFirst({
          where: {
            triggerType: {
              in: input.triggerTypes,
            },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            triggerType: true,
            subject: true,
            body: true,
          },
        })
  }

  private async getCampaignSupporterRecipients(campaignId: string): Promise<string[]> {
    return Array.from(
      new Set(
        (
          await prisma.donation.findMany({
            where: {
              campaignId,
              status: "completed",
              donorEmail: {
                not: null,
              },
            },
            select: {
              donorEmail: true,
            },
          })
        )
          .map((donation) => donation.donorEmail?.trim())
          .filter((email): email is string => Boolean(email))
      )
    )
  }

  private async sendWorkflowEmail(input: {
    request: NextRequest
    to: string[]
    subject: string
    text: string
    campaignId: string
    campaignTitle: string
    triggerKey: CampaignUpdateRuleKey | DonationRuleKey
    templateId: string
    errorMessage: string
  }): Promise<{ deliveredCount: number; messageId?: string }> {
    const sendResult = await this.sendEmail({
      to: input.to,
      subject: input.subject,
      text: input.text,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: input.triggerKey,
      templateId: input.templateId,
    })

    const sendPayload = sendResult.body

    if (sendResult.status < 200 || sendResult.status >= 300) {
      throw new Error(
        (typeof sendPayload.error === "string" && sendPayload.error) || input.errorMessage
      )
    }

    return {
      deliveredCount:
        typeof sendPayload.deliveredCount === "number" ? sendPayload.deliveredCount : input.to.length,
      messageId:
        typeof sendPayload.messageId === "string" ? sendPayload.messageId : undefined,
    }
  }

  getNewlyReachedMilestone(input: {
    previousRaisedAmount: number
    nextRaisedAmount: number
    targetAmount: number
  }): number | null {
    if (input.targetAmount <= 0) return null

    const previousPercent = (input.previousRaisedAmount / input.targetAmount) * 100
    const nextPercent = (input.nextRaisedAmount / input.targetAmount) * 100

    const newlyReached = MILESTONE_THRESHOLDS.filter(
      (threshold) => previousPercent < threshold && nextPercent >= threshold
    )

    if (newlyReached.length === 0) return null

    return newlyReached[newlyReached.length - 1]
  }

  async triggerCampaignUpdateWorkflow(input: {
    request: NextRequest
    campaignId: string
    campaignTitle: string
    targetAmount: number
    raisedAmount: number
    donorCount: number
    fundRaiserName: string
    updateTitle: string
    updateContent: string
    workflowRuleId?: string | null
  }): Promise<WorkflowResult> {
    const workflowRule = await this.findActiveWorkflowRule({
      triggerTypes: ["campaign_update", "manual_update"],
      workflowRuleId: input.workflowRuleId,
    })

    if (!workflowRule) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "Campaign update workflow is not enabled.",
      }
    }

    const recipients = await this.getCampaignSupporterRecipients(input.campaignId)

    if (recipients.length === 0) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "No donor email recipients are available for this campaign yet.",
      }
    }

    const template = new EmailTemplate({
      id: workflowRule.id,
      ruleKey: mapCampaignUpdateRuleKey(workflowRule.triggerType),
      label: workflowRule.name,
      description: "Campaign update workflow template.",
      subjectTemplate: workflowRule.subject,
      bodyTemplate: workflowRule.body,
      updatedAt: undefined,
    })

    const replacements = buildTemplateReplacements({
      campaignTitle: input.campaignTitle,
      targetAmount: input.targetAmount,
      raisedAmount: input.raisedAmount,
      donorCount: input.donorCount,
      fundRaiserName: input.fundRaiserName,
      recipientLabel: "supporter",
      campaignUpdateTitle: input.updateTitle,
      campaignUpdateContent: input.updateContent,
      campaignUpdateDate: new Date().toLocaleString(),
      updateTitle: input.updateTitle,
      updateContent: input.updateContent,
    })

    const subject = template.renderSubject(replacements)
    const body = template.renderBody(replacements)

    const result = await this.sendWorkflowEmail({
      request: input.request,
      to: recipients,
      subject,
      text: body,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: "manual_update",
      templateId: workflowRule.id,
      errorMessage: "Campaign update workflow email failed to send.",
    })

    return {
      attempted: true,
      deliveredCount: result.deliveredCount,
      messageId: result.messageId,
    }
  }

  async triggerThankYouWorkflow(input: {
    request: NextRequest
    campaignId: string
    campaignTitle: string
    targetAmount: number
    raisedAmount: number
    donorCount: number
    fundRaiserName: string
    donorEmail: string | null
    workflowRuleId?: string | null
  }): Promise<WorkflowResult> {
    if (!input.donorEmail) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "The completed donation does not have a valid donor email address.",
      }
    }

    const workflowRule = await this.findActiveWorkflowRule({
      triggerTypes: ["donation_received", "thank_you"],
      workflowRuleId: input.workflowRuleId,
    })

    if (!workflowRule) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "Thank-you workflow is not enabled.",
      }
    }

    const template = new EmailTemplate({
      id: workflowRule.id,
      ruleKey: mapDonationRuleKey(workflowRule.triggerType),
      label: workflowRule.name,
      description: "Automatic donation thank-you email template.",
      subjectTemplate: workflowRule.subject,
      bodyTemplate: workflowRule.body,
      updatedAt: undefined,
    })

    const replacements = buildTemplateReplacements({
      campaignTitle: input.campaignTitle,
      targetAmount: input.targetAmount,
      raisedAmount: input.raisedAmount,
      donorCount: input.donorCount,
      fundRaiserName: input.fundRaiserName,
      recipientLabel: "donor",
    })

    const subject = template.renderSubject(replacements)
    const body = template.renderBody(replacements)

    const result = await this.sendWorkflowEmail({
      request: input.request,
      to: [input.donorEmail],
      subject,
      text: body,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: "thank_you",
      templateId: workflowRule.id,
      errorMessage: "Thank-you workflow email failed to send.",
    })

    return {
      attempted: true,
      deliveredCount: result.deliveredCount,
      messageId: result.messageId,
    }
  }

  async triggerNewDonationAlertWorkflow(input: {
    request: NextRequest
    campaignId: string
    campaignTitle: string
    targetAmount: number
    raisedAmount: number
    donorCount: number
    fundRaiserName: string
    fundRaiserEmail: string | null
  }): Promise<WorkflowResult> {
    if (!input.fundRaiserEmail) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "The fund raiser account does not have a valid email address.",
      }
    }

    const workflowRule = await this.findActiveWorkflowRule({
      triggerTypes: ["new_donation_alert", "donation_alert"],
    })

    if (!workflowRule) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "New donation alert workflow is not enabled.",
      }
    }

    const template = new EmailTemplate({
      id: workflowRule.id,
      ruleKey: mapDonationRuleKey(workflowRule.triggerType),
      label: workflowRule.name,
      description: "Automatic new donation alert email template.",
      subjectTemplate: workflowRule.subject,
      bodyTemplate: workflowRule.body,
      updatedAt: undefined,
    })

    const replacements = buildTemplateReplacements({
      campaignTitle: input.campaignTitle,
      targetAmount: input.targetAmount,
      raisedAmount: input.raisedAmount,
      donorCount: input.donorCount,
      fundRaiserName: input.fundRaiserName,
      recipientLabel: "fund raiser",
    })

    const subject = template.renderSubject(replacements)
    const body = template.renderBody(replacements)

    const result = await this.sendWorkflowEmail({
      request: input.request,
      to: [input.fundRaiserEmail],
      subject,
      text: body,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: "new_donation_alert",
      templateId: workflowRule.id,
      errorMessage: "New donation alert workflow email failed to send.",
    })

    return {
      attempted: true,
      deliveredCount: result.deliveredCount,
      messageId: result.messageId,
    }
  }

  async triggerMilestoneWorkflow(input: {
    request: NextRequest
    campaignId: string
    campaignTitle: string
    targetAmount: number
    previousRaisedAmount: number
    raisedAmount: number
    donorCount: number
    fundRaiserName: string
    workflowRuleId?: string | null
  }): Promise<WorkflowResult> {
    const milestonePercent = this.getNewlyReachedMilestone({
      previousRaisedAmount: input.previousRaisedAmount,
      nextRaisedAmount: input.raisedAmount,
      targetAmount: input.targetAmount,
    })

    if (!milestonePercent) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "This donation did not cross a new campaign milestone.",
      }
    }

    const workflowRule = await this.findActiveWorkflowRule({
      triggerTypes: ["milestone_50", "milestone"],
      workflowRuleId: input.workflowRuleId,
    })

    if (!workflowRule) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "Milestone workflow is not enabled.",
      }
    }

    const recipients = await this.getCampaignSupporterRecipients(input.campaignId)

    if (recipients.length === 0) {
      return {
        attempted: false,
        deliveredCount: 0,
        reason: "No supporter email recipients are available for this campaign yet.",
      }
    }

    const template = new EmailTemplate({
      id: workflowRule.id,
      ruleKey: mapDonationRuleKey(workflowRule.triggerType),
      label: workflowRule.name,
      description: "Automatic campaign milestone update email template.",
      subjectTemplate: workflowRule.subject,
      bodyTemplate: workflowRule.body,
      updatedAt: undefined,
    })

    const replacements = buildTemplateReplacements({
      campaignTitle: input.campaignTitle,
      targetAmount: input.targetAmount,
      raisedAmount: input.raisedAmount,
      donorCount: input.donorCount,
      fundRaiserName: input.fundRaiserName,
      recipientLabel: "supporter",
      milestonePercent,
    })

    const subject = template.renderSubject(replacements)
    const body = template.renderBody(replacements)

    const result = await this.sendWorkflowEmail({
      request: input.request,
      to: recipients,
      subject,
      text: body,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      triggerKey: "milestone",
      templateId: workflowRule.id,
      errorMessage: "Milestone workflow email failed to send.",
    })

    return {
      attempted: true,
      deliveredCount: result.deliveredCount,
      messageId: result.messageId,
    }
  }
}
