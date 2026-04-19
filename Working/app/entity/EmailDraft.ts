import type { DonorSegmentKey } from "@/app/entity/Donor"

export type EmailDraftPurpose = "thank_you" | "milestone_update" | "re_engagement" | "campaign_update" | "custom"
export type EmailDraftTone = "warm" | "urgent" | "professional" | "appreciative"

export interface EmailDraftProps {
  id: string
  campaignId?: string
  campaignTitle?: string
  segmentKey?: DonorSegmentKey
  purpose: EmailDraftPurpose
  tone: EmailDraftTone
  subject: string
  body: string
  variationLabel: string
  generatedAt: string
  savedAt?: string
  modelName?: string
}

export interface EmailDraftSummary {
  id: string
  campaignId?: string
  campaignTitle?: string
  segmentKey?: DonorSegmentKey
  segmentLabel?: string
  purpose: EmailDraftPurpose
  purposeLabel: string
  tone: EmailDraftTone
  toneLabel: string
  subject: string
  body: string
  variationLabel: string
  generatedAt: string
  savedAt?: string
  previewText: string
  modelName?: string
}

export function getEmailDraftPurposeLabel(value: EmailDraftPurpose): string {
  switch (value) {
    case "thank_you":
      return "Thank-you"
    case "milestone_update":
      return "Milestone update"
    case "re_engagement":
      return "Re-engagement"
    case "campaign_update":
      return "Campaign update"
    case "custom":
      return "Custom purpose"
    default:
      return "Campaign update"
  }
}

export function getEmailDraftToneLabel(value: EmailDraftTone): string {
  switch (value) {
    case "warm":
      return "Warm"
    case "urgent":
      return "Urgent"
    case "professional":
      return "Professional"
    case "appreciative":
    default:
      return "Appreciative"
  }
}

export class EmailDraft {
  private readonly props: EmailDraftProps

  constructor(props: EmailDraftProps) {
    this.props = props
  }

  getId(): string {
    return this.props.id
  }

  getSubject(): string {
    return this.props.subject
  }

  getBody(): string {
    return this.props.body
  }

  getCampaignId(): string | undefined {
    return this.props.campaignId
  }

  getCampaignTitle(): string | undefined {
    return this.props.campaignTitle
  }

  getSegmentKey(): DonorSegmentKey | undefined {
    return this.props.segmentKey
  }

  getPurpose(): EmailDraftPurpose {
    return this.props.purpose
  }

  getTone(): EmailDraftTone {
    return this.props.tone
  }

  getVariationLabel(): string {
    return this.props.variationLabel
  }

  getGeneratedAt(): string {
    return this.props.generatedAt
  }

  getSavedAt(): string | undefined {
    return this.props.savedAt
  }

  getModelName(): string | undefined {
    return this.props.modelName
  }

  withEdits(edits: { subject?: string; body?: string; savedAt?: string }): EmailDraft {
    return new EmailDraft({
      ...this.props,
      subject: edits.subject ?? this.props.subject,
      body: edits.body ?? this.props.body,
      savedAt: edits.savedAt ?? this.props.savedAt,
    })
  }

  getPreviewText(maxLength = 160): string {
    const normalized = this.props.body.replace(/\s+/g, " ").trim()
    if (normalized.length <= maxLength) {
      return normalized
    }
    return `${normalized.slice(0, maxLength - 1)}…`
  }

  toSummary(segmentLabel?: string): EmailDraftSummary {
    return {
      id: this.props.id,
      campaignId: this.props.campaignId,
      campaignTitle: this.props.campaignTitle,
      segmentKey: this.props.segmentKey,
      segmentLabel,
      purpose: this.props.purpose,
      purposeLabel: getEmailDraftPurposeLabel(this.props.purpose),
      tone: this.props.tone,
      toneLabel: getEmailDraftToneLabel(this.props.tone),
      subject: this.props.subject,
      body: this.props.body,
      variationLabel: this.props.variationLabel,
      generatedAt: this.props.generatedAt,
      savedAt: this.props.savedAt,
      previewText: this.getPreviewText(),
      modelName: this.props.modelName,
    }
  }
}
