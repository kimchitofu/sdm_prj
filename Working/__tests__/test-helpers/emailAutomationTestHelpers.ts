export type AiDraftInput = {
  campaignId: string
  campaignTitle: string
  donorSegment: string
  purpose: string
  customPurpose?: string
  tone: string
  additionalInstructions?: string
}

export type AiDraftPayload = {
  campaignId: string
  campaignTitle: string
  donorSegment: string
  purpose: string
  tone: string
  additionalInstructions: string
  regenerate?: boolean
}

export type AiDraft = {
  subject: string
  body: string
}

export function resolveEmailPurpose(input: AiDraftInput): string {
  if (input.purpose === "Custom") {
    return input.customPurpose?.trim() ?? ""
  }

  return input.purpose.trim()
}

export function canGenerateAiDraft(input: AiDraftInput): boolean {
  const hasRequiredFields = Boolean(
    input.campaignId.trim() &&
      input.campaignTitle.trim() &&
      input.donorSegment.trim() &&
      input.purpose.trim() &&
      input.tone.trim(),
  )

  if (!hasRequiredFields) {
    return false
  }

  if (input.purpose === "Custom") {
    return Boolean(input.customPurpose?.trim())
  }

  return true
}

export function buildAiDraftPayload(input: AiDraftInput, regenerate = false): AiDraftPayload {
  if (!canGenerateAiDraft(input)) {
    throw new Error("AI draft generation requires campaign, donor segment, purpose, and tone.")
  }

  return {
    campaignId: input.campaignId,
    campaignTitle: input.campaignTitle,
    donorSegment: input.donorSegment,
    purpose: resolveEmailPurpose(input),
    tone: input.tone,
    additionalInstructions: input.additionalInstructions?.trim() ?? "",
    regenerate,
  }
}

export async function generateAiDraft(
  input: AiDraftInput,
  aiService: (payload: AiDraftPayload) => Promise<AiDraft>,
): Promise<AiDraft> {
  const payload = buildAiDraftPayload(input)
  return aiService(payload)
}

export async function regenerateAiDraftVariation(
  input: AiDraftInput,
  aiService: (payload: AiDraftPayload) => Promise<AiDraft>,
): Promise<AiDraft> {
  const payload = buildAiDraftPayload(input, true)
  return aiService(payload)
}

export type WorkflowType =
  | "CAMPAIGN_UPDATE"
  | "THANK_YOU"
  | "MILESTONE_UPDATE"
  | "NEW_DONATION_ALERT"

export type TriggerEvent = {
  type: "CAMPAIGN_UPDATE_POSTED" | "DONATION_COMPLETED" | "MILESTONE_REACHED"
  donorEmail?: string
  donorName?: string
  donationAmount?: number
  updateTitle?: string
  updateContent?: string
  previousRaisedAmount?: number
  newRaisedAmount?: number
  milestonePercentage?: number
}

export type WorkflowTemplate = {
  id: number
  type: WorkflowType
  enabled: boolean
  subject: string
  body: string
}

export type Recipient = {
  name?: string
  email: string
}

export type Campaign = {
  id: number
  title: string
  raisedAmount: number
  targetAmount: number
  fundraiserEmail?: string
  supporters: Recipient[]
}

export type EmailLog = {
  id: number
  workflowType?: WorkflowType | "MANUAL" | "QUICK_TEST"
  recipientEmail: string
  subject: string
  body: string
  status: "SENT" | "QUEUED" | "FAILED"
  campaignId?: number
  sentAt: Date
}

export type SendWorkflowResult = {
  sent: boolean
  reason?: string
  recipients: string[]
  logs: EmailLog[]
}

export function isValidEmail(email: string | undefined): boolean {
  if (!email) return false
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

export function matchesWorkflowTrigger(workflowType: WorkflowType, event: TriggerEvent): boolean {
  if (workflowType === "CAMPAIGN_UPDATE") return event.type === "CAMPAIGN_UPDATE_POSTED"
  if (workflowType === "THANK_YOU") return event.type === "DONATION_COMPLETED"
  if (workflowType === "MILESTONE_UPDATE") return event.type === "MILESTONE_REACHED"
  if (workflowType === "NEW_DONATION_ALERT") return event.type === "DONATION_COMPLETED"

  return false
}

export function resolveWorkflowRecipients(
  workflowType: WorkflowType,
  campaign: Campaign,
  event: TriggerEvent,
): Recipient[] {
  if (workflowType === "CAMPAIGN_UPDATE") {
    return campaign.supporters.filter((recipient) => isValidEmail(recipient.email))
  }

  if (workflowType === "THANK_YOU") {
    return isValidEmail(event.donorEmail) ? [{ name: event.donorName, email: event.donorEmail as string }] : []
  }

  if (workflowType === "MILESTONE_UPDATE") {
    return campaign.supporters.filter((recipient) => isValidEmail(recipient.email))
  }

  if (workflowType === "NEW_DONATION_ALERT") {
    return isValidEmail(campaign.fundraiserEmail) ? [{ email: campaign.fundraiserEmail as string }] : []
  }

  return []
}

export function replaceWorkflowPlaceholders(
  template: string,
  campaign: Campaign,
  event: TriggerEvent,
): string {
  return template
    .replaceAll("{{campaignTitle}}", campaign.title)
    .replaceAll("{{raisedAmount}}", campaign.raisedAmount.toString())
    .replaceAll("{{targetAmount}}", campaign.targetAmount.toString())
    .replaceAll("{{donorName}}", event.donorName ?? "supporter")
    .replaceAll("{{donationAmount}}", (event.donationAmount ?? 0).toString())
    .replaceAll("{{campaignUpdateTitle}}", event.updateTitle ?? "Campaign update")
    .replaceAll("{{campaignUpdateContent}}", event.updateContent ?? "")
    .replaceAll("{{milestonePercentage}}", (event.milestonePercentage ?? 0).toString())
}

export function shouldSendWorkflowEmail(
  workflow: WorkflowTemplate,
  campaign: Campaign,
  event: TriggerEvent,
): boolean {
  if (!workflow.enabled) return false
  if (!matchesWorkflowTrigger(workflow.type, event)) return false
  return resolveWorkflowRecipients(workflow.type, campaign, event).length > 0
}

export async function sendWorkflowEmail(args: {
  workflow: WorkflowTemplate
  campaign: Campaign
  event: TriggerEvent
  emailService: (input: { to: string; subject: string; body: string }) => Promise<{ success: boolean }>
  logRepository: { create: (log: Omit<EmailLog, "id">) => Promise<EmailLog> }
}): Promise<SendWorkflowResult> {
  const { workflow, campaign, event, emailService, logRepository } = args

  if (!workflow.enabled) {
    return { sent: false, reason: "WORKFLOW_DISABLED", recipients: [], logs: [] }
  }

  if (!matchesWorkflowTrigger(workflow.type, event)) {
    return { sent: false, reason: "TRIGGER_NOT_MET", recipients: [], logs: [] }
  }

  const recipients = resolveWorkflowRecipients(workflow.type, campaign, event)

  if (recipients.length === 0) {
    return { sent: false, reason: "NO_VALID_RECIPIENTS", recipients: [], logs: [] }
  }

  const subject = replaceWorkflowPlaceholders(workflow.subject, campaign, event)
  const body = replaceWorkflowPlaceholders(workflow.body, campaign, event)
  const logs: EmailLog[] = []

  for (const recipient of recipients) {
    await emailService({ to: recipient.email, subject, body })

    const log = await logRepository.create({
      workflowType: workflow.type,
      recipientEmail: recipient.email,
      subject,
      body,
      status: "SENT",
      campaignId: campaign.id,
      sentAt: new Date(),
    })

    logs.push(log)
  }

  return {
    sent: true,
    recipients: recipients.map((recipient) => recipient.email),
    logs,
  }
}

export function createEmailLog(input: Omit<EmailLog, "id" | "sentAt"> & { sentAt?: Date }): EmailLog {
  return {
    id: Math.floor(Math.random() * 100000),
    sentAt: input.sentAt ?? new Date(),
    ...input,
  }
}

export function sortEmailLogsNewestFirst(logs: EmailLog[]): EmailLog[] {
  return [...logs].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
}

export function getEmailActivityDisplayState(logs: EmailLog[]): {
  isEmpty: boolean
  message?: string
  records: EmailLog[]
} {
  if (logs.length === 0) {
    return {
      isEmpty: true,
      message: "No email activity has been recorded yet.",
      records: [],
    }
  }

  return {
    isEmpty: false,
    records: sortEmailLogsNewestFirst(logs),
  }
}

export async function sendManualEmail(args: {
  campaign: Campaign
  recipients: Recipient[]
  subject: string
  body: string
  emailService: (input: { to: string; subject: string; body: string }) => Promise<{ success: boolean }>
  logRepository: { create: (log: Omit<EmailLog, "id">) => Promise<EmailLog> }
}): Promise<EmailLog[]> {
  const validRecipients = args.recipients.filter((recipient) => isValidEmail(recipient.email))
  const logs: EmailLog[] = []

  for (const recipient of validRecipients) {
    await args.emailService({ to: recipient.email, subject: args.subject, body: args.body })
    const log = await args.logRepository.create({
      workflowType: "MANUAL",
      recipientEmail: recipient.email,
      subject: args.subject,
      body: args.body,
      status: "SENT",
      campaignId: args.campaign.id,
      sentAt: new Date(),
    })
    logs.push(log)
  }

  return logs
}

export async function sendQuickTestEmail(args: {
  workflow: WorkflowTemplate
  testRecipientEmail: string
  emailService: (input: { to: string; subject: string; body: string }) => Promise<{ success: boolean }>
  logRepository: { create: (log: Omit<EmailLog, "id">) => Promise<EmailLog> }
}): Promise<EmailLog> {
  if (!isValidEmail(args.testRecipientEmail)) {
    throw new Error("A valid test recipient email is required.")
  }

  await args.emailService({
    to: args.testRecipientEmail,
    subject: args.workflow.subject,
    body: args.workflow.body,
  })

  return args.logRepository.create({
    workflowType: "QUICK_TEST",
    recipientEmail: args.testRecipientEmail,
    subject: args.workflow.subject,
    body: args.workflow.body,
    status: "SENT",
    sentAt: new Date(),
  })
}
