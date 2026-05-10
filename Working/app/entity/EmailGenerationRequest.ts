import { getDonorSegmentDescription, getDonorSegmentLabel, type DonorSegmentKey } from "@/app/entity/Donor"
import { getEmailDraftPurposeLabel, getEmailDraftToneLabel, type EmailDraftPurpose, type EmailDraftTone } from "@/app/entity/EmailDraft"

export interface EmailGenerationRequestProps {
  campaignId?: string
  campaignTitle: string
  campaignSummary?: string
  targetAmount?: number
  raisedAmount?: number
  donorCount?: number
  segmentKey: DonorSegmentKey
  recipientCount: number
  recipientsWithEmailCount: number
  purpose: EmailDraftPurpose
  tone: EmailDraftTone
  variationIndex?: number
  additionalPrompt?: string
  customPurposeText?: string
}

export interface EmailGenerationRequestPayload extends EmailGenerationRequestProps {}

export class EmailGenerationRequest {
  constructor(private readonly props: EmailGenerationRequestProps) {}

  validate(): string | null {
    if (!this.props.campaignTitle?.trim()) {
      return "Campaign title is required before generating an AI draft."
    }

    if (!this.props.segmentKey) {
      return "Please choose a donor segment before generating an AI draft."
    }

    if (this.props.recipientCount <= 0) {
      return "The selected donor segment does not currently have any recipients."
    }

    if (this.props.purpose === "custom" && !this.props.customPurposeText?.trim()) {
      return "Please enter a custom email purpose before generating an AI draft."
    }

    return null
  }

  getPurposeLabel(): string {
    if (this.props.purpose === "custom") {
      return this.getCustomPurposeLabel()
    }
    return getEmailDraftPurposeLabel(this.props.purpose)
  }

  getCustomPurposeLabel(): string {
    return this.props.customPurposeText?.trim() || "Custom purpose"
  }

  getToneLabel(): string {
    return getEmailDraftToneLabel(this.props.tone)
  }

  getSegmentLabel(): string {
    return getDonorSegmentLabel(this.props.segmentKey)
  }

  getSegmentDescription(): string {
    return getDonorSegmentDescription(this.props.segmentKey)
  }

  getVariationLabel(): string {
    const variationNumber = this.props.variationIndex ?? 1
    return `Variation ${variationNumber}`
  }

  buildSystemInstruction(): string {
    return [
      "You are helping a fund raiser write targeted donor outreach emails for a fundraising platform.",
      "Write persuasive but ethical fundraising emails.",
      "Do not invent fake facts, names, or donation amounts.",
      "Return valid JSON only with keys: subject, body.",
      "The subject should be concise and natural.",
      "The body should be 2 to 4 short paragraphs with a clear call to action.",
      "Avoid markdown, bullet points, and placeholders like [Name].",
      "Use the donor segment and campaign context to tailor the draft.",
    ].join(" ")
  }

  buildUserPrompt(): string {
    const campaignSummary = this.props.campaignSummary?.trim() || "No extra campaign summary was provided."
    const targetAmount = typeof this.props.targetAmount === "number" ? this.props.targetAmount.toLocaleString() : "Not provided"
    const raisedAmount = typeof this.props.raisedAmount === "number" ? this.props.raisedAmount.toLocaleString() : "Not provided"
    const donorCount = typeof this.props.donorCount === "number" ? this.props.donorCount.toLocaleString() : "Not provided"
    const additionalPrompt = this.props.additionalPrompt?.trim()

    const segmentSpecificGuidance = this.getSegmentSpecificGuidance()
    const purposeSpecificGuidance = this.getPurposeSpecificGuidance()

    return [
      `Campaign title: ${this.props.campaignTitle}`,
      `Campaign summary: ${campaignSummary}`,
      `Target amount: ${targetAmount}`,
      `Raised amount: ${raisedAmount}`,
      `Donor count: ${donorCount}`,
      `Selected donor segment: ${this.getSegmentLabel()}`,
      `Segment description: ${this.getSegmentDescription()}`,
      `Segment size: ${this.props.recipientCount}`,
      `Recipients with email captured: ${this.props.recipientsWithEmailCount}`,
      `Email purpose: ${this.getPurposeLabel()}`,
      this.props.purpose === "custom" ? `Custom purpose detail: ${this.getCustomPurposeLabel()}` : "",
      `Tone: ${this.getToneLabel()}`,
      `Variation requested: ${this.getVariationLabel()}`,
      `Segment prompt template guidance: ${segmentSpecificGuidance}`,
      `Purpose prompt template guidance: ${purposeSpecificGuidance}`,
      additionalPrompt ? `Additional user instruction: ${additionalPrompt}` : "",
      "Write a subject and body for a group email draft that a fund raiser can review before sending.",
      "Make the wording specific to this segment rather than generic.",
      "Keep the body concise, emotionally appropriate, and donation-platform friendly.",
    ]
      .filter(Boolean)
      .join("\n")
  }

  toPayload(): EmailGenerationRequestPayload {
    return { ...this.props }
  }

  private getSegmentSpecificGuidance(): string {
    switch (this.props.segmentKey) {
      case "high_value":
        return "Acknowledge strong prior support, use respectful stewardship language, and emphasise impact and meaningful next steps."
      case "repeat":
        return "Recognise their continued support and build on trust with a progress-focused update and clear next action."
      case "recent":
        return "Reference recent momentum, keep the message fresh and timely, and invite them to stay involved."
      case "anonymous":
      default:
        return "Respect privacy, avoid overpersonal language, and keep the message general and appreciative."
    }
  }

  private getPurposeSpecificGuidance(): string {
    switch (this.props.purpose) {
      case "thank_you":
        return "Lead with gratitude and explain the impact of continued support without sounding transactional."
      case "milestone_update":
        return "Highlight campaign progress, social proof, and what the next milestone unlocks."
      case "re_engagement":
        return "Reconnect politely, remind them of the campaign mission, and invite them back without guilt."
      case "campaign_update":
        return "Provide a short campaign update and a clear reason why the supporter should care right now."
      case "custom":
        return `Follow this custom purpose closely: ${this.getCustomPurposeLabel()}. Keep the message aligned to that intent.`
      default:
        return "Provide a short campaign update and a clear reason why the supporter should care right now."
    }
  }
}
